import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { TransactionService } from "@/lib/services/transaction-service";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const provider = process.env.DB_PROVIDER || "mysql";
    let userId = null;
    let email = "";
    let name = "";
    let role = "user";

    if (provider === "supabase") {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
      email = user.email || "";
      
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("name, role")
        .eq("id", user.id)
        .single();
      
      name = profile?.name || user.user_metadata?.name || user.email || "";
      role = profile?.role || "user";
    } else {
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
      email = user.email;
      name = user.name;
      role = user.role;
    }

    // Fetch transactions by user ID using TransactionService
    const transactions = await TransactionService.getByUserId(userId);

    // Calculate user transaction statistics
    const total = transactions.length;
    const success = transactions.filter((t: any) => t.topup_status === 'success').length;
    const pending = transactions.filter((t: any) => t.topup_status === 'pending' || t.topup_status === 'processing').length;
    const failed = transactions.filter((t: any) => t.topup_status === 'failed').length;
    const stats = { total, success, pending, failed };

    let digiflazzBalance = null;
    if (role === 'admin') {
      try {
        const { checkBalance } = await import('@/lib/digiflazz');
        const balanceRes = await checkBalance();
        if (balanceRes && balanceRes.data) {
          digiflazzBalance = Number(balanceRes.data.deposit) || 0;
        }
      } catch (balErr) {
        console.error("Failed to fetch Digiflazz balance for user dashboard admin:", balErr);
      }
    }

    return NextResponse.json({
      user: { id: userId, name, email, role },
      transactions,
      stats,
      digiflazzBalance
    });
  } catch (err: any) {
    console.error("User dashboard API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
