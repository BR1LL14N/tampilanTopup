import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { GameService } from "@/lib/services/game-service";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { executeQuery } = await import("@/lib/db");

    // Auto-purge any non-game operator / PPOB entries
    try {
      await executeQuery(
        `DELETE FROM products WHERE game_id IN (
          SELECT id FROM games WHERE category IN ('Pulsa', 'Masa Aktif', 'Data', 'PLN', 'E-Money', 'TV', 'Pertagas', 'BPJS', 'PBB', 'Pasca') OR slug IN ('telkomsel', 'indosat', 'xl', 'axis', 'tri', 'three', 'smartfren', 'by-u', 'byu', 'pln', 'k-vision-dan-gol', 'k-vision', 'kvision', 'gopay', 'ovo', 'dana', 'linkaja', 'shopeepay')
        )`
      );
      await executeQuery(
        `DELETE FROM games WHERE category IN ('Pulsa', 'Masa Aktif', 'Data', 'PLN', 'E-Money', 'TV', 'Pertagas', 'BPJS', 'PBB', 'Pasca') OR slug IN ('telkomsel', 'indosat', 'xl', 'axis', 'tri', 'three', 'smartfren', 'by-u', 'byu', 'pln', 'k-vision-dan-gol', 'k-vision', 'kvision', 'gopay', 'ovo', 'dana', 'linkaja', 'shopeepay')`
      );
    } catch (_) {}

    const games = await GameService.getAll();
    
    // Fetch product counts and successful transactions counts on the server
    const gamesWithCount = await Promise.all(
      games.map(async (game: any) => {
        const rowsProd = await executeQuery(`SELECT COUNT(*) as count FROM products WHERE game_id = $1`, [game.id]);
        const prodCount = Number(rowsProd[0]?.count ?? rowsProd[0]?.COUNT ?? 0);

        const rowsTx = await executeQuery(
          `SELECT COUNT(t.id) as count 
           FROM transactions t 
           JOIN products p ON t.product_id = p.id 
           WHERE p.game_id = $1 
             AND t.payment_status IN ('paid', 'success') 
             AND t.topup_status = 'success'`,
          [game.id]
        );
        const txCount = Number(rowsTx[0]?.count ?? rowsTx[0]?.COUNT ?? 0);

        return {
          ...game,
          products_count: prodCount,
          success_transactions_count: txCount,
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
