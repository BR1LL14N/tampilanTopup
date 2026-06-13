import { NextRequest, NextResponse } from "next/server";
import { GameService } from "@/lib/services/game-service";
import { executeQuery } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const games = await GameService.getAllActive();
    const products = await executeQuery("SELECT * FROM products WHERE status = $1 ORDER BY sort_order ASC", [true]);
    
    return NextResponse.json({ games, products });
  } catch (err: any) {
    console.error("Calculator data API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
