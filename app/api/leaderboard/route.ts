import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getUsersTable() {
  const provider = process.env.DB_PROVIDER || "mysql";
  return provider === "mysql" ? "users" : "public.user_profiles";
}

function getDateFilterClause(period: string, provider: string): string {
  if (period === "seasonal" || !period) return "";
  const days = period === "24h" ? 1 : period === "7d" ? 7 : period === "30d" ? 30 : null;
  if (!days) return "";
  return provider === "mysql"
    ? `AND t.created_at >= NOW() - INTERVAL ${days} DAY`
    : `AND t.created_at >= NOW() - INTERVAL '${days} days'`;
}

/**
 * Masking nama pelanggan untuk privasi: "Ahmad Rizki" -> "Ahmad R."
 * Nama satu kata: "Ahmad" -> "Ah***"
 */
function maskName(name: string): string {
  if (!name) return "Pengguna";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    const w = parts[0];
    return w.length <= 2 ? w : `${w.slice(0, 2)}${"*".repeat(Math.min(w.length - 2, 4))}`;
  }
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || "";
  return `${first} ${lastInitial}.`;
}

function getLevel(totalSpent: number): string {
  if (totalSpent >= 10_000_000) return "Platinum";
  if (totalSpent >= 5_000_000) return "Gold";
  if (totalSpent >= 1_000_000) return "Silver";
  return "Bronze";
}

export async function GET(req: NextRequest) {
  try {
    const provider = process.env.DB_PROVIDER || "mysql";
    const usersTable = getUsersTable();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "seasonal";
    const dateFilter = getDateFilterClause(period, provider);

    const rows = await executeQuery<{
      user_id: string;
      name: string;
      avatar_url: string | null;
      transactions: number;
      total_spent: number;
    }>(
      `SELECT
         t.user_id AS user_id,
         u.name AS name,
         u.avatar_url AS avatar_url,
         COUNT(*) AS transactions,
         SUM(t.amount) AS total_spent
       FROM transactions t
       JOIN ${usersTable} u ON u.id = t.user_id
       WHERE t.topup_status = 'success' AND t.user_id IS NOT NULL ${dateFilter}
       GROUP BY t.user_id, u.name, u.avatar_url
       ORDER BY total_spent DESC
       LIMIT 50`,
      []
    );

    const players = rows.map((row) => {
      const totalSpent = Number(row.total_spent) || 0;
      const transactions = Number(row.transactions) || 0;
      return {
        nickname: maskName(row.name),
        level: getLevel(totalSpent),
        transactions,
        points: Math.floor(totalSpent / 1000),
        totalSpent,
        average: transactions > 0 ? Math.round(totalSpent / transactions) : 0,
        avatar: row.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(row.user_id)}`,
      };
    });

    // Cari peringkat pengguna yang sedang login, walau dia tidak masuk top 50
    let currentUserRank: { rank: number; totalSpent: number } | null = null;
    const currentUser = await getCurrentUser();
    if (currentUser) {
      const meRows = await executeQuery<{ total_spent: number }>(
        `SELECT COALESCE(SUM(amount), 0) AS total_spent
         FROM transactions
         WHERE user_id = $1 AND topup_status = 'success' ${dateFilter.replace("t.created_at", "created_at")}`,
        [currentUser.id]
      );
      const mySpent = Number(meRows[0]?.total_spent) || 0;

      if (mySpent > 0) {
        const rankRows = await executeQuery<{ better_count: number }>(
          `SELECT COUNT(*) AS better_count FROM (
             SELECT t.user_id, SUM(t.amount) AS spent
             FROM transactions t
             WHERE t.topup_status = 'success' AND t.user_id IS NOT NULL ${dateFilter}
             GROUP BY t.user_id
             HAVING SUM(t.amount) > $1
           ) ranked`,
          [mySpent]
        );
        const betterCount = Number(rankRows[0]?.better_count) || 0;
        currentUserRank = { rank: betterCount + 1, totalSpent: mySpent };
      }
    }

    return NextResponse.json({ players, currentUserRank });
  } catch (err: any) {
    console.error("[leaderboard] Error fetching leaderboard:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
