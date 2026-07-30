import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { DIGIFLAZZ_CONFIG } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameSlug, targetId, serverId, sku } = body;

    if (!targetId || !targetId.trim()) {
      return NextResponse.json({ error: "User ID wajib diisi" }, { status: 400 });
    }

    const cleanTargetId = targetId.trim();
    const cleanServerId = (serverId || "").trim();

    // Construct customer_no according to game format
    let customerNo = cleanTargetId;
    const slugLower = (gameSlug || "").toLowerCase();

    if (slugLower.includes("mobile-legend") || slugLower.includes("mlbb")) {
      if (!cleanServerId) {
        return NextResponse.json({ error: "Zone ID / Server ID wajib diisi untuk Mobile Legends" }, { status: 400 });
      }
      customerNo = `${cleanTargetId}${cleanServerId}`;
    } else if (slugLower.includes("genshin")) {
      customerNo = cleanServerId ? `${cleanTargetId}${cleanServerId}` : cleanTargetId;
    } else if (cleanServerId) {
      customerNo = `${cleanTargetId}${cleanServerId}`;
    }

    const username = process.env.DIGIFLAZZ_USERNAME || DIGIFLAZZ_CONFIG.username;
    const apiKey = process.env.DIGIFLAZZ_API_KEY || DIGIFLAZZ_CONFIG.apiKey;
    const refId = `INQ-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    const sign = crypto.createHash("md5").update(`${username}${apiKey}${refId}`).digest("hex");

    // Primary buyer_sku_code for inquiry (default ml5 for MLBB or provided sku)
    let buyerSku = sku || "ml5";
    if (slugLower.includes("free-fire") || slugLower.includes("ff")) {
      buyerSku = sku || "ff5";
    } else if (slugLower.includes("pubg")) {
      buyerSku = sku || "pubg10";
    }

    const digiUrl = `${DIGIFLAZZ_CONFIG.baseUrl}/transaction`;

    const digiRes = await fetch(digiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: "inquiry-game",
        username,
        buyer_sku_code: buyerSku,
        customer_no: customerNo,
        ref_id: refId,
        sign,
      }),
    });

    const result = await digiRes.json();
    const data = result.data;

    if (!data) {
      return NextResponse.json(
        { error: "Gagal terhubung ke server verifikasi ID Digiflazz" },
        { status: 502 }
      );
    }

    // Check if Digiflazz returned customer_name / nickname successfully
    if (data.customer_name && data.customer_name.trim() !== "") {
      return NextResponse.json({
        success: true,
        nickname: data.customer_name.trim(),
        customerNo,
        message: data.message || "Validasi ID berhasil",
      });
    }

    // Handle Digiflazz rate limit or invalid ID messages
    if (data.rc === "83") {
      return NextResponse.json(
        { error: "Server verifikasi sedang sibuk (Rate Limit). Silakan coba lagi sebentar lagi." },
        { status: 429 }
      );
    }

    if (data.status === "Gagal" || data.rc === "42" || data.rc === "14") {
      return NextResponse.json(
        { error: data.message || "ID Akun tidak ditemukan / tidak valid. Mohon periksa kembali." },
        { status: 400 }
      );
    }

    // Fallback if Digiflazz returned success without nickname
    if (data.status === "Sukses" || data.rc === "00") {
      return NextResponse.json({
        success: true,
        nickname: data.customer_name || `Akun ID: ${customerNo}`,
        customerNo,
        message: "ID Akun Terverifikasi",
      });
    }

    return NextResponse.json(
      { error: data.message || "ID Akun tidak ditemukan atau tidak valid" },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Check ID error:", err);
    return NextResponse.json({ error: err.message || "Gagal memverifikasi ID Player" }, { status: 500 });
  }
}
