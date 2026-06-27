import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { getCurrentUser, verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// 1. GET: Retrieve notifications for current logged in user (or admin)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdmin();
    const provider = process.env.DB_PROVIDER || "mysql";
    const notifTable = provider === "supabase" ? "public.notifications" : "notifications";

    let sql = "";
    let params: any[] = [];

    if (isAdmin) {
      // Admin sees notifications with is_admin = true/1, plus any notifications addressed to their user_id
      const adminVal = provider === "supabase" ? "true" : "1";
      sql = `
        SELECT id, title, message, type, link, is_read, created_at
        FROM ${notifTable}
        WHERE is_admin = ${adminVal} OR user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `;
      params = [user.id];
    } else {
      // Regular customer sees only notifications addressed to their user_id
      sql = `
        SELECT id, title, message, type, link, is_read, created_at
        FROM ${notifTable}
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `;
      params = [user.id];
    }

    const notifications = await executeQuery(sql, params);
    
    // Map boolean values if provider is MySQL (which returns 1/0 instead of true/false)
    const mappedNotifications = notifications.map((n: any) => ({
      ...n,
      is_read: provider === "supabase" ? !!n.is_read : n.is_read === 1 || n.is_read === true
    }));

    return NextResponse.json({ notifications: mappedNotifications });
  } catch (err: any) {
    console.error("Failed to fetch notifications:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. PUT: Mark notification(s) as read
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = await verifyAdmin();
    const { id, all } = await req.json();

    const provider = process.env.DB_PROVIDER || "mysql";
    const notifTable = provider === "supabase" ? "public.notifications" : "notifications";
    const readVal = provider === "supabase" ? true : 1;

    if (all) {
      if (isAdmin) {
        const adminVal = provider === "supabase" ? "true" : "1";
        // Mark all admin notifications & own user notifications as read
        const sql = `
          UPDATE ${notifTable}
          SET is_read = $1
          WHERE is_admin = ${adminVal} OR user_id = $2
        `;
        await executeQuery(sql, [readVal, user.id]);
      } else {
        // Mark all customer notifications as read
        const sql = `
          UPDATE ${notifTable}
          SET is_read = $1
          WHERE user_id = $2
        `;
        await executeQuery(sql, [readVal, user.id]);
      }
    } else if (id) {
      // Mark specific notification as read
      const sql = `
        UPDATE ${notifTable}
        SET is_read = $1
        WHERE id = $2
      `;
      await executeQuery(sql, [readVal, id]);
    } else {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to mark notifications as read:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
