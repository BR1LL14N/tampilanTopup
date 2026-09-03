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

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("start_date");
    const endDateParam = searchParams.get("end_date");

    // Default to Current Month (1st day of month 00:00:00 to last day 23:59:59)
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const formatToSqlDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    let startSql = startDateParam ? `${startDateParam} 00:00:00` : formatToSqlDate(defaultStart);
    let endSql = endDateParam ? `${endDateParam} 23:59:59` : formatToSqlDate(defaultEnd);

    // 1. Fetch Real-time Digiflazz Balance
    let digiflazzBalance = 0;
    try {
      const balanceRes = await checkBalance();
      if (balanceRes && balanceRes.data) {
        digiflazzBalance = Number(balanceRes.data.deposit) || 0;
      }
    } catch (balErr) {
      console.error("Failed to fetch Digiflazz balance in finance API:", balErr);
    }

    // 2. Fetch Successful Transactions Stats (Revenue & Cost of Goods Sold / Modal)
    const successStatsSql = `
      SELECT 
        COUNT(*) as success_count,
        COALESCE(SUM(t.amount), 0) as gross_revenue,
        COALESCE(SUM(COALESCE(p.price, 0)), 0) as total_cogs
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      WHERE (t.payment_status IN ('paid', 'settlement', 'success') OR t.topup_status = 'success')
        AND t.created_at >= $1 AND t.created_at <= $2
    `;
    const successRows = await executeQuery(successStatsSql, [startSql, endSql]);
    const successCount = Number(successRows[0]?.success_count ?? successRows[0]?.SUCCESS_COUNT ?? 0);
    const grossRevenue = Number(successRows[0]?.gross_revenue ?? successRows[0]?.GROSS_REVENUE ?? 0);
    const totalCogs = Number(successRows[0]?.total_cogs ?? successRows[0]?.TOTAL_COGS ?? 0);
    const netProfit = grossRevenue - totalCogs;
    const profitMargin = grossRevenue > 0 ? Number(((netProfit / grossRevenue) * 100).toFixed(1)) : 0;

    // 3. Fetch Pending and Failed Counts
    const otherStatsSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN t.topup_status IN ('pending', 'processing') OR t.payment_status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count,
        COALESCE(SUM(CASE WHEN t.topup_status = 'failed' OR t.payment_status IN ('failed', 'expire', 'cancel') THEN 1 ELSE 0 END), 0) as failed_count,
        COUNT(*) as total_count
      FROM transactions t
      WHERE t.created_at >= $1 AND t.created_at <= $2
    `;
    const otherRows = await executeQuery(otherStatsSql, [startSql, endSql]);
    const pendingCount = Number(otherRows[0]?.pending_count ?? otherRows[0]?.PENDING_COUNT ?? 0);
    const failedCount = Number(otherRows[0]?.failed_count ?? otherRows[0]?.FAILED_COUNT ?? 0);
    const totalCount = Number(otherRows[0]?.total_count ?? otherRows[0]?.TOTAL_COUNT ?? 0);

    // 4. Fetch Game Performance Breakdown
    const gameBreakdownSql = `
      SELECT 
        COALESCE(g.name, 'Produk Umum') as game_name,
        COUNT(t.id) as tx_count,
        COALESCE(SUM(t.amount), 0) as revenue,
        COALESCE(SUM(COALESCE(p.price, 0)), 0) as cogs,
        COALESCE(SUM(t.amount - COALESCE(p.price, 0)), 0) as profit
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN games g ON p.game_id = g.id
      WHERE (t.payment_status IN ('paid', 'settlement', 'success') OR t.topup_status = 'success')
        AND t.created_at >= $1 AND t.created_at <= $2
      GROUP BY g.name
      ORDER BY revenue DESC
      LIMIT 8
    `;
    const gameRows = await executeQuery(gameBreakdownSql, [startSql, endSql]);
    const gameBreakdown = gameRows.map((r: any) => ({
      game_name: r.game_name,
      tx_count: Number(r.tx_count || 0),
      revenue: Number(r.revenue || 0),
      cogs: Number(r.cogs || 0),
      profit: Number(r.profit || 0),
    }));

    // 5. Fetch Detailed Transactions (Profit per transaction)
    const txSql = `
      SELECT 
        t.id,
        t.invoice,
        t.amount,
        t.payment_method,
        t.payment_status,
        t.topup_status,
        t.created_at,
        p.name as product_name,
        COALESCE(p.price, 0) as cogs,
        (t.amount - COALESCE(p.price, 0)) as profit,
        COALESCE(g.name, 'Game') as game_name
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN games g ON p.game_id = g.id
      WHERE (t.payment_status IN ('paid', 'settlement', 'success') OR t.topup_status = 'success')
        AND t.created_at >= $1 AND t.created_at <= $2
      ORDER BY t.created_at DESC
      LIMIT 200
    `;
    const txRows = await executeQuery(txSql, [startSql, endSql]);
    const transactions = txRows.map((tx: any) => ({
      id: tx.id,
      invoice: tx.invoice,
      amount: Number(tx.amount || 0),
      cogs: Number(tx.cogs || 0),
      profit: Number(tx.profit || 0),
      product_name: tx.product_name || "Top Up",
      game_name: tx.game_name || "Game",
      payment_method: tx.payment_method || "-",
      payment_status: tx.payment_status,
      topup_status: tx.topup_status,
      created_at: tx.created_at,
    }));

    return NextResponse.json({
      success: true,
      period: {
        start_date: startSql.slice(0, 10),
        end_date: endSql.slice(0, 10),
      },
      summary: {
        digiflazz_balance: digiflazzBalance,
        gross_revenue: grossRevenue,
        total_cogs: totalCogs,
        net_profit: netProfit,
        profit_margin: profitMargin,
        success_count: successCount,
        pending_count: pendingCount,
        failed_count: failedCount,
        total_count: totalCount,
      },
      game_breakdown: gameBreakdown,
      transactions,
    });
  } catch (err: any) {
    console.error("Finance API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
