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
    let userCount = 0;
    try {
      const userRows = await executeQuery(`SELECT COUNT(*) as count FROM ${userTable}`);
      userCount = Number(userRows[0]?.count ?? userRows[0]?.COUNT ?? 0);
    } catch (e) {
      console.error("userCount query err:", e);
    }

    // 2. Fetch Game Count
    let gameCount = 0;
    try {
      const gameRows = await executeQuery(`SELECT COUNT(*) as count FROM games`);
      gameCount = Number(gameRows[0]?.count ?? gameRows[0]?.COUNT ?? 0);
    } catch (e) {
      console.error("gameCount query err:", e);
    }

    // 3. Fetch Transaction Stats
    let totalTxCount = 0;
    let totalRevenue = 0;
    try {
      const txCountRows = await executeQuery(`SELECT COUNT(*) as count FROM transactions`);
      totalTxCount = Number(txCountRows[0]?.count ?? txCountRows[0]?.COUNT ?? 0);
    } catch (e) {
      console.error("totalTxCount query err:", e);
    }

    try {
      const revenueRows = await executeQuery(`
        SELECT COALESCE(SUM(amount), 0) as revenue 
        FROM transactions 
        WHERE status = 1 OR payment_status = $1 OR topup_status = $2
      `, ['paid', 'success']);
      totalRevenue = Number(revenueRows[0]?.revenue ?? revenueRows[0]?.REVENUE ?? 0);
    } catch (e) {
      try {
        const rev2 = await executeQuery(`SELECT COALESCE(SUM(amount), 0) as revenue FROM transactions`);
        totalRevenue = Number(rev2[0]?.revenue ?? rev2[0]?.REVENUE ?? 0);
      } catch (e2) {}
    }

    // 4. Fetch 5 Recent Transactions
    let recentTxRows: any[] = [];
    try {
      recentTxRows = await executeQuery(`
        SELECT t.*, p.name as product_name, g.name as game_name, g.slug as game_slug
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        LEFT JOIN games g ON p.game_id = g.id
        ORDER BY t.created_at DESC
        LIMIT 5
      `);
    } catch (e) {
      console.error("recentTxRows query err:", e);
    }

    // 5. Fetch Top Selling Products
    let topProductRows: any[] = [];
    try {
      topProductRows = await executeQuery(`
        SELECT 
          p.name, 
          p.provider_sku as sku, 
          g.name as game_name,
          COUNT(t.id) as sold,
          COALESCE(SUM(t.amount), 0) as revenue
        FROM products p
        JOIN games g ON p.game_id = g.id
        LEFT JOIN transactions t ON t.product_id = p.id
        GROUP BY p.id, p.name, p.provider_sku, g.name
        ORDER BY revenue DESC
        LIMIT 4
      `);
    } catch (e) {
      console.error("topProductRows query err:", e);
    }

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
    let checkoutRows: any[] = [];
    try {
      checkoutRows = await executeQuery(`
        SELECT t.*, p.name as product_name, g.name as game_name, u.name as user_name
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        LEFT JOIN games g ON p.game_id = g.id
        LEFT JOIN ${userTable} u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 10
      `);
    } catch (e) {}

    let paymentRows: any[] = [];
    try {
      paymentRows = await executeQuery(`
        SELECT t.*, p.name as product_name, g.name as game_name, u.name as user_name
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        LEFT JOIN games g ON p.game_id = g.id
        LEFT JOIN ${userTable} u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 10
      `);
    } catch (e) {}

    let failedRows: any[] = [];
    try {
      failedRows = await executeQuery(`
        SELECT t.*, p.name as product_name, g.name as game_name, u.name as user_name
        FROM transactions t
        LEFT JOIN products p ON t.product_id = p.id
        LEFT JOIN games g ON p.game_id = g.id
        LEFT JOIN ${userTable} u ON t.user_id = u.id
        WHERE t.payment_status = 'failed' OR t.topup_status = 'failed'
        ORDER BY t.created_at DESC
        LIMIT 10
      `);
    } catch (e) {}

    let syncRows: any[] = [];
    try {
      syncRows = await executeQuery(`
        SELECT p.name as product_name, p.provider_sku as sku, p.price, p.sell_price, p.updated_at, g.name as game_name
        FROM products p
        LEFT JOIN games g ON p.game_id = g.id
        ORDER BY p.updated_at DESC
        LIMIT 10
      `);
    } catch (e) {}

    let feedbackRows: any[] = [];
    try {
      feedbackRows = await executeQuery(`
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM reviews r
        LEFT JOIN ${userTable} u ON r.user_id = u.id
        ORDER BY r.created_at DESC
        LIMIT 10
      `);
    } catch (e) {}

    const digiflazzMode = process.env.DIGIFLAZZ_MODE || 'production';
    const digiflazzUsername = process.env.DIGIFLAZZ_USERNAME || 'mitsurushop';

    return NextResponse.json({
      stats: {
        userCount,
        gameCount,
        totalTxCount,
        totalRevenue,
        digiflazzBalance,
        digiflazzMode,
        digiflazzUsername
      },
      recentTransactions: recentTxRows,
      topProducts: topProductRows,
      activities: {
        checkouts: checkoutRows,
        payments: paymentRows,
        failed: failedRows,
        syncs: syncRows,
        feedbacks: feedbackRows
      }
    });

  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ 
      stats: {
        userCount: 0,
        gameCount: 0,
        totalTxCount: 0,
        totalRevenue: 0,
        digiflazzBalance: 0,
        digiflazzMode: 'production',
        digiflazzUsername: 'mitsurushop'
      },
      recentTransactions: [],
      topProducts: [],
      activities: {
        checkouts: [],
        payments: [],
        failed: [],
        syncs: [],
        feedbacks: []
      }
    });
  }
}
