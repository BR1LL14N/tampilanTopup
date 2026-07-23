import { NextResponse } from "next/server";
import { BannerService } from "@/lib/services/banner-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banners = await BannerService.getAllActive();
    return NextResponse.json({ banners });
  } catch (err: any) {
    console.error("[GET /api/banners] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch banners" }, { status: 500 });
  }
}
