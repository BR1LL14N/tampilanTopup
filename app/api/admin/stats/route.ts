import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { checkBalance } from "@/lib/digiflazz";

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

    // 6. Fetch Digiflazz Balance
    let digiflazzBalance = 0;
    try {
      const balanceRes = await checkBalance();
      if (balanceRes && balanceRes.data) {
        digiflazzBalance = Number(balanceRes.data.deposit) || 0;
      }
    } catch (balErr) {
      console.error("Failed to fetch Digiflazz balance for stats:", balErr);
    }

    // Fetch checkout activities
    const checkoutRows = await executeQuery(`
      SELECT t.*, p.name as product_name, g.name as game_name, u.name as user_name
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN games g ON p.game_id = g.id
      LEFT JOIN ${userTable} u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);

    // Fetch payment activities
    const paymentRows = await executeQuery(`
      SELECT t.*, p.name as product_name, g.name as game_name, u.name as user_name
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN games g ON p.game_id = g.id
      LEFT JOIN ${userTable} u ON t.user_id = u.id
      WHERE t.payment_status = $1 OR t.topup_status = $2
      ORDER BY COALESCE(t.paid_at, t.updated_at) DESC
      LIMIT 10
    `, ['paid', 'success']);

    // Fetch sync activities
    const syncRows = await executeQuery(`
      SELECT p.name as product_name, p.provider_sku as sku, p.price, p.sell_price, p.updated_at, g.name as game_name
      FROM products p
      LEFT JOIN games g ON p.game_id = g.id
      WHERE p.provider = 'digiflazz'
      ORDER BY p.updated_at DESC
      LIMIT 10
    `);

    // Fetch feedbacks (reviews)
    const feedbackRows = await executeQuery(`
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM reviews r
      LEFT JOIN ${userTable} u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);

    return NextResponse.json({
      stats: {
        userCount,
        gameCount,
        totalTxCount,
        totalRevenue,
        digiflazzBalance
      },
      recentTransactions: recentTxRows,
      topProducts: topProductRows,
      activities: {
        checkouts: checkoutRows,
        payments: paymentRows,
        syncs: syncRows,
        feedbacks: feedbackRows
      }
    });
  } catch (err: any) {
    console.error("Admin stats API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
