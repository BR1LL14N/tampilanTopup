import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const provider = process.env.DB_PROVIDER || "mysql";

    if (provider === "supabase") {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return NextResponse.json({ user: null });
      }
      
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();
        
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.user_metadata?.name || user.email,
          email: user.email,
          role: profile?.role || "user"
        }
      });
    } else {
      const user = await getCurrentUser();
      return NextResponse.json({ user });
    }
  } catch (err: any) {
    return NextResponse.json({ user: null });
  }
}
