import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { executeQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const provider = process.env.DB_PROVIDER || "mysql";
    const userTable = provider === "supabase" ? "user_profiles" : "users";

    // 1. Fetch User Count
    const userRows = await executeQuery(`SELECT COUNT(*) as count FROM ${userTable}`);
    const userCount = Number(userRows[0]?.count ?? userRows[0]?.COUNT ?? 0);

    // 2. Fetch Game Count
    const gameRows = await executeQuery(`SELECT COUNT(*) as count FROM games`);
    const gameCount = Number(gameRows[0]?.count ?? gameRows[0]?.COUNT ?? 0);

    // 3. Fetch Transaction Stats
    const txCountRows = await executeQuery(`SELECT COUNT(*) as count FROM transactions`);
    const totalTxCount = Number(txCountRows[0]?.count ?? txCountRows[0]?.COUNT ?? 0);

    const revenueRows = await executeQuery(`
      SELECT SUM(amount) as revenue 
      FROM transactions 
      WHERE payment_status = $1 OR topup_status = $2
    `, ['paid', 'success']);
    const totalRevenue = Number(revenueRows[0]?.revenue ?? revenueRows[0]?.REVENUE ?? 0);

    // 4. Fetch 5 Recent Transactions
    const recentTxRows = await executeQuery(`
      SELECT t.*, p.name as product_name, g.name as game_name, g.slug as game_slug
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN games g ON p.game_id = g.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `);

    // 5. Fetch 4 Top Selling Products
    // MySQL and PostgreSQL compatible GROUP BY syntax
    const topProductRows = await executeQuery(`
      SELECT 
        p.name, 
        p.provider_sku as sku, 
        g.name as game_name,
        COUNT(t.id) as sold,
        COALESCE(SUM(t.amount), 0) as revenue
      FROM products p
      JOIN games g ON p.game_id = g.id
      LEFT JOIN transactions t ON t.product_id = p.id AND (t.payment_status = $1 OR t.topup_status = $2)
      GROUP BY p.id, p.name, p.provider_sku, g.name
      ORDER BY revenue DESC
      LIMIT 4
    `, ['paid', 'success']);

    return NextResponse.json({
      stats: {
        userCount,
        gameCount,
        totalTxCount,
        totalRevenue
      },
      recentTransactions: recentTxRows,
      topProducts: topProductRows
    });
  } catch (err: any) {
    console.error("Admin stats API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
