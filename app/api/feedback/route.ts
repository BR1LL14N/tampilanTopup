import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// 1. GET: Fetch active reviews to display on landing page
export async function GET(req: NextRequest) {
  try {
    const provider = process.env.DB_PROVIDER || "mysql";
    const userTable = provider === "supabase" ? "public.user_profiles" : "users";
    const reviewsTable = provider === "supabase" ? "public.reviews" : "reviews";
    const statusCondition = provider === "supabase" ? "status = true" : "status = 1";

    const sql = `
      SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name, u.avatar_url
      FROM ${reviewsTable} r
      JOIN ${userTable} u ON r.user_id = u.id
      WHERE ${statusCondition}
      ORDER BY r.created_at DESC
      LIMIT 20
    `;

    const reviews = await executeQuery(sql);
    return NextResponse.json({ reviews });
  } catch (err: any) {
    console.error("Failed to fetch homepage reviews:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. POST: Create a new review (Authenticated only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Anda harus login untuk menulis ulasan." }, { status: 401 });
    }

    const { rating, comment } = await req.json();

    if (!rating || !comment || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating (1-5) dan Kritik/Saran wajib diisi." }, { status: 400 });
    }

    const provider = process.env.DB_PROVIDER || "mysql";
    const reviewsTable = provider === "supabase" ? "public.reviews" : "reviews";
    const messagesTable = provider === "supabase" ? "public.review_messages" : "review_messages";
    const notifTable = provider === "supabase" ? "public.notifications" : "notifications";

    const reviewId = crypto.randomUUID();
    const messageId = crypto.randomUUID();

    // 1. Save review
    const insertReviewSql = `
      INSERT INTO ${reviewsTable} (id, user_id, rating, comment, status)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await executeQuery(insertReviewSql, [
      reviewId,
      user.id,
      rating,
      comment,
      provider === "supabase" ? true : 1
    ]);

    // 2. Save comment as first message in thread
    const insertMessageSql = `
      INSERT INTO ${messagesTable} (id, review_id, sender, message)
      VALUES ($1, $2, $3, $4)
    `;
    await executeQuery(insertMessageSql, [
      messageId,
      reviewId,
      "user",
      comment
    ]);

    // 3. Create In-App Notification for Admin
    const notifId = crypto.randomUUID();
    const insertNotifSql = `
      INSERT INTO ${notifTable} (id, user_id, is_admin, title, message, type, link)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await executeQuery(insertNotifSql, [
      notifId,
      null,
      provider === "supabase" ? true : 1, // is_admin
      "Kritik & Saran Baru",
      `Ulasan ${rating} Bintang dari ${user.name}: "${comment.substring(0, 45)}..."`,
      "new_feedback",
      `/admin/feedbacks/${reviewId}`
    ]);

    // 4. Trigger WhatsApp notification to Admin (Non-blocking)
    try {
      const { SettingService } = await import("@/lib/services/setting-service");
      const adminPhone = await SettingService.get("wa_admin_number", "");
      if (adminPhone) {
        const { WhatsappService } = await import("@/lib/services/whatsapp-service");
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mitsurushop.com";
        const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

        const adminMsg = `*MITSURU - KRITIK & SARAN BARU* 📬

Ulasan baru masuk dari pelanggan:
• *Pelanggan:* ${user.name} (${user.email})
• *Rating:* *${stars}* (${rating}/5)
• *Komentar:* "${comment}"

Balas masukan ini langsung di dashboard admin:
👉 *${siteUrl}/admin/feedbacks/${reviewId}*`;

        WhatsappService.sendMessage(adminPhone, adminMsg).catch(err => {
          console.error("Async admin WA notification for feedback failed:", err);
        });
      }
    } catch (waErr) {
      console.error("Failed triggers WA notification for feedback:", waErr);
    }

    return NextResponse.json({ success: true, id: reviewId });
  } catch (err: any) {
    console.error("Create review API error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
