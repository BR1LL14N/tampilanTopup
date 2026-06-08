import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const provider = process.env.DB_PROVIDER || "mysql";

    if (provider === "supabase") {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "user",
          },
        },
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    } else {
      // MySQL Mode
      // Check if user already exists
      const existing = await executeQuery("SELECT id FROM users WHERE email = $1 LIMIT 1", [email]);
      if (existing.length > 0) {
        return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
      }

      const id = crypto.randomUUID();
      const hashedPassword = await hashPassword(password);

      // Insert user
      await executeQuery(
        "INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)",
        [id, email, hashedPassword, name, "user"]
      );

      // Generate token
      const token = signToken({
        id,
        email,
        name,
        role: "user",
      });

      const response = NextResponse.json({
        success: true,
        user: { name, email, role: "user" },
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
    console.error("Register API error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
