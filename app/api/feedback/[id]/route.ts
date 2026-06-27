import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { getCurrentUser, verifyAdmin } from "@/lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// 1. GET: Fetch review details & messages thread
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reviewId = params.id;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdmin();
    const provider = process.env.DB_PROVIDER || "mysql";
    const userTable = provider === "supabase" ? "public.user_profiles" : "users";
    const reviewsTable = provider === "supabase" ? "public.reviews" : "reviews";
    const messagesTable = provider === "supabase" ? "public.review_messages" : "review_messages";

    // Fetch review details
    const reviewSql = `
      SELECT r.id, r.user_id, r.rating, r.comment, r.status, r.created_at, u.name as user_name
      FROM ${reviewsTable} r
      JOIN ${userTable} u ON r.user_id = u.id
      WHERE r.id = $1 LIMIT 1
    `;
    const reviewRows = await executeQuery(reviewSql, [reviewId]);

    if (reviewRows.length === 0) {
      return NextResponse.json({ error: "Ulasan tidak ditemukan" }, { status: 404 });
    }

    const review = reviewRows[0];

    // Security Check: Only the review owner or admin can view this chat
    if (review.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch messages thread
    const messagesSql = `
      SELECT m.id, m.sender, m.message, m.created_at
      FROM ${messagesTable} m
      WHERE m.review_id = $1
      ORDER BY m.created_at ASC
    `;
    const messages = await executeQuery(messagesSql, [reviewId]);

    return NextResponse.json({ review, messages });
  } catch (err: any) {
    console.error("Failed to fetch review chat details:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. POST: Send a message in the review chat thread
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reviewId = params.id;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Pesan tidak boleh kosong" }, { status: 400 });
    }

    const isAdmin = await verifyAdmin();
    const provider = process.env.DB_PROVIDER || "mysql";
    const userTable = provider === "supabase" ? "public.user_profiles" : "users";
    const reviewsTable = provider === "supabase" ? "public.reviews" : "reviews";
    const messagesTable = provider === "supabase" ? "public.review_messages" : "review_messages";
    const notifTable = provider === "supabase" ? "public.notifications" : "notifications";

    // Fetch review details to find owner
    const reviewSql = `SELECT user_id, comment FROM ${reviewsTable} WHERE id = $1 LIMIT 1`;
    const reviewRows = await executeQuery(reviewSql, [reviewId]);

    if (reviewRows.length === 0) {
      return NextResponse.json({ error: "Ulasan tidak ditemukan" }, { status: 404 });
    }

    const review = reviewRows[0];

    // Security Check: Only the review owner or admin can post in this chat
    if (review.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sender = isAdmin ? "admin" : "user";
    const messageId = crypto.randomUUID();

    // 1. Insert message
    const insertMessageSql = `
      INSERT INTO ${messagesTable} (id, review_id, sender, message)
      VALUES ($1, $2, $3, $4)
    `;
    await executeQuery(insertMessageSql, [
      messageId,
      reviewId,
      sender,
      message.trim()
    ]);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mitsurushop.com";

    if (isAdmin) {
      // 2a. Notify Customer (In-App)
      const notifId = crypto.randomUUID();
      const insertNotifSql = `
        INSERT INTO ${notifTable} (id, user_id, is_admin, title, message, type, link)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await executeQuery(insertNotifSql, [
        notifId,
        review.user_id,
        provider === "supabase" ? false : 0, // is_admin
        "Balasan Kritik & Saran",
        `Admin membalas masukan Anda: "${message.substring(0, 45)}..."`,
        "feedback_reply",
        `/reviews/${reviewId}`
      ]);

      // 2b. Notify Customer (WhatsApp) - Non-blocking
      try {
        const profile = await executeQuery(`SELECT name, phone FROM ${userTable} WHERE id = $1 LIMIT 1`, [review.user_id]);
        if (profile && profile.length > 0 && profile[0].phone) {
          const clientPhone = profile[0].phone;
          const clientName = profile[0].name || "Pelanggan";
          const { WhatsappService } = await import("@/lib/services/whatsapp-service");

          const clientMsg = `*MITSURU - BALASAN KRITIK & SARAN* 📬

Halo Kak ${clientName}, Kritik & saran Anda telah dibalas oleh Admin Mitsuru:

"${message}"

Buka link di bawah ini untuk membalas kembali percakapan chat:
👉 *${siteUrl}/reviews/${reviewId}*`;

          WhatsappService.sendMessage(clientPhone, clientMsg).catch(err => {
            console.error("Async client WA notification for feedback reply failed:", err);
          });
        }
      } catch (waErr) {
        console.error("Failed triggers WA notification for feedback reply:", waErr);
      }

    } else {
      // 3a. Notify Admin (In-App)
      const notifId = crypto.randomUUID();
      const insertNotifSql = `
        INSERT INTO ${notifTable} (id, user_id, is_admin, title, message, type, link)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await executeQuery(insertNotifSql, [
        notifId,
        null,
        provider === "supabase" ? true : 1, // is_admin
        "Pesan Baru Kritik & Saran",
        `Pesan baru dari ${user.name}: "${message.substring(0, 45)}..."`,
        "feedback_reply",
        `/admin/feedbacks/${reviewId}`
      ]);

      // 3b. Notify Admin (WhatsApp) - Non-blocking
      try {
        const { SettingService } = await import("@/lib/services/setting-service");
        const adminPhone = await SettingService.get("wa_admin_number", "");
        if (adminPhone) {
          const { WhatsappService } = await import("@/lib/services/whatsapp-service");

          const adminMsg = `*MITSURU - BALASAN TIKET* 💬

Pesan baru masuk di tiket ulasan pelanggan:
• *Pelanggan:* ${user.name}
• *Pesan:* "${message}"

Balas langsung di:
👉 *${siteUrl}/admin/feedbacks/${reviewId}*`;

          WhatsappService.sendMessage(adminPhone, adminMsg).catch(err => {
            console.error("Async admin WA notification for feedback reply failed:", err);
          });
        }
      } catch (waErr) {
        console.error("Failed triggers WA notification for feedback reply:", waErr);
      }
    }

    return NextResponse.json({ success: true, messageId });
  } catch (err: any) {
    console.error("Post review message API error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
