import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { verifyAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

// 1. GET: Fetch all reviews (with status & user name) for admin
export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const provider = process.env.DB_PROVIDER || "mysql";
    const userTable = provider === "supabase" ? "public.user_profiles" : "users";
    const reviewsTable = provider === "supabase" ? "public.reviews" : "reviews";

    const sql = `
      SELECT r.id, r.rating, r.comment, r.status, r.created_at, u.name as user_name, u.email as user_email
      FROM ${reviewsTable} r
      JOIN ${userTable} u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `;

    const reviews = await executeQuery(sql);
    return NextResponse.json({ reviews });
  } catch (err: any) {
    console.error("Failed to fetch admin reviews list:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. PUT: Update review status (visibility or ticket status)
export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { reviewId, status, visibility } = await req.json();

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const provider = process.env.DB_PROVIDER || "mysql";
    const reviewsTable = provider === "supabase" ? "public.reviews" : "reviews";

    if (visibility !== undefined) {
      // Toggle visibility (status: 1/0 or true/false)
      const targetVal = provider === "supabase" ? (!!visibility) : (visibility ? 1 : 0);
      const sql = `UPDATE ${reviewsTable} SET status = $1 WHERE id = $2`;
      await executeQuery(sql, [targetVal, reviewId]);
    }

    // Optionally we can update ticket status if needed, but since reviews use `status` column for visibility,
    // we use reviewsTable.status for frontpage display.
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to update review status:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. DELETE: Remove a review and its chat history
export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get("id");

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const provider = process.env.DB_PROVIDER || "mysql";
    const reviewsTable = provider === "supabase" ? "public.reviews" : "reviews";

    const sql = `DELETE FROM ${reviewsTable} WHERE id = $1`;
    await executeQuery(sql, [reviewId]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete review:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
