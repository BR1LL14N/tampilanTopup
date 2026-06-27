import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { executeQuery } from "@/lib/db"
import { signToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const provider = process.env.DB_PROVIDER || "mysql";

      if (provider === "mysql") {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // Check if user exists in local MySQL database
            const existingUsers = await executeQuery(
              "SELECT id, email, name, role FROM users WHERE email = $1 LIMIT 1",
              [user.email]
            )

            let localUser;
            if (existingUsers.length > 0) {
              localUser = existingUsers[0]
            } else {
              // Create user in MySQL
              const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User"
              const id = user.id // Keep the same UUID from Supabase for consistency
              const email = user.email!
              const randomPass = require("crypto").randomBytes(32).toString("hex")

              await executeQuery(
                "INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)",
                [id, email, randomPass, name, "user"]
              )

              localUser = { id, email, name, role: "user" }
            }

            // Generate JWT and set auth_token cookie
            const token = signToken(localUser)
            const cookieStore = await cookies()
            cookieStore.set("auth_token", token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7, // 7 days
              path: "/",
            })
          }
        } catch (dbErr) {
          console.error("Failed to bridge Supabase OAuth session to MySQL:", dbErr)
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Redirect ke login dengan pesan error jika ada masalah
  return NextResponse.redirect(
    new URL("/auth/login?error=oauth_callback_error", requestUrl.origin)
  )
}
