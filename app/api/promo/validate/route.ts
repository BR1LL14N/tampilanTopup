import { NextRequest, NextResponse } from "next/server";
import { PromoService } from "@/lib/services/promo-service";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Kode promo tidak valid" }, { status: 400 });
    }

    const uppercaseCode = code.trim().toUpperCase();

    // Query promo code details from database
    const promo = await PromoService.getByCode(uppercaseCode);

    if (!promo) {
      return NextResponse.json({ error: "Kode promo tidak ditemukan" }, { status: 404 });
    }

    // 1. Check if promo code is active
    if (!promo.status) {
      return NextResponse.json({ error: "Kode promo sudah tidak aktif" }, { status: 400 });
    }

    // 2. Check if promo has reached its usage limit
    if (Number(promo.uses_count) >= Number(promo.max_uses)) {
      return NextResponse.json({ error: "Batas pemakaian kode promo telah habis" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      promo: {
        id: promo.id,
        code: promo.code,
        discount_amount: promo.discount_amount,
        discount_percent: promo.discount_percent,
      }
    });

  } catch (error: any) {
    console.error("Promo validation API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
