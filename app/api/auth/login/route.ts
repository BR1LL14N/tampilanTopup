import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { comparePassword, signToken } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const provider = process.env.DB_PROVIDER || "mysql";

    if (provider === "supabase") {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      
      // Get role from user profile in database
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
        
      return NextResponse.json({ 
        success: true, 
        user: { 
          name: data.user.user_metadata?.name || data.user.email,
          email: data.user.email,
          role: profile?.role || "user"
        } 
      });
    } else {
      // MySQL Mode
      const users = await executeQuery("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
      if (users.length === 0) {
        return NextResponse.json({ error: "Email atau password salah" }, { status: 400 });
      }
      const user = users[0];
      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        return NextResponse.json({ error: "Email atau password salah" }, { status: 400 });
      }

      // Generate JWT token
      const token = signToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Set cookie
      const response = NextResponse.json({
        success: true,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return response;
    }
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
