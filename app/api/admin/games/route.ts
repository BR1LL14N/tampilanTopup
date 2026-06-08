import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { GameService } from "@/lib/services/game-service";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const games = await GameService.getAll();
    
    // Fetch product counts on the server
    const { executeQuery } = await import("@/lib/db");
    const gamesWithCount = await Promise.all(
      games.map(async (game: any) => {
        const rows = await executeQuery(`SELECT COUNT(*) as count FROM products WHERE game_id = $1`, [game.id]);
        // Support both PostgreSQL (count) and MySQL (COUNT(*)) column naming
        const count = Number(rows[0]?.count ?? rows[0]?.COUNT ?? 0);
        return {
          ...game,
          products_count: count
        };
      })
    );

    return NextResponse.json({ games: gamesWithCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const data = await req.json();
    const game = await GameService.create(data);
    return NextResponse.json({ success: true, game });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id, ...data } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Missing game ID" }, { status: 400 });
    }
    await GameService.update(id, data);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing game ID" }, { status: 400 });
    }
    await GameService.delete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
