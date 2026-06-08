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

    return NextResponse.json({
      user: { id: userId, name, email, role },
      transactions
    });
  } catch (err: any) {
    console.error("User dashboard API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
