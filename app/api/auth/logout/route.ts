import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const provider = process.env.DB_PROVIDER || "mysql";
    
    if (provider === "supabase") {
      const supabase = await createClient();
      await supabase.auth.signOut();
      return NextResponse.json({ success: true });
    } else {
      const response = NextResponse.json({ success: true });
      response.cookies.set("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
      return response;
    }
  } catch (err: any) {
    console.error("Logout API error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
