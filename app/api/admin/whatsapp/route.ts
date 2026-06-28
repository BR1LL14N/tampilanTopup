import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { SettingService } from "@/lib/services/setting-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const action = req.nextUrl.searchParams.get("action") || "status";
    const endpoint = await SettingService.get("wa_endpoint", "http://localhost:5000/send");
    
    // Extract base URL from endpoint (e.g. http://localhost:5000)
    let baseUrl = "http://localhost:5000";
    try {
      const urlObj = new URL(endpoint);
      baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    } catch (e) {
      // Use default fallback
    }

    if (action === "status") {
      const response = await fetch(`${baseUrl}/status`, { cache: "no-store" });
      const data = await response.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ status: "disconnected", error: err.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { action, phone, message } = await req.json();
    const endpoint = await SettingService.get("wa_endpoint", "http://localhost:5000/send");
    
    let baseUrl = "http://localhost:5000";
    try {
      const urlObj = new URL(endpoint);
      baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    } catch (e) {
      // Use default fallback
    }

    if (action === "logout") {
      const response = await fetch(`${baseUrl}/logout`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      return NextResponse.json(data);
    }

    if (action === "test") {
      if (!phone || !message) {
        return NextResponse.json({ error: "Nomor tujuan dan isi pesan wajib diisi." }, { status: 400 });
      }

      // Format target phone number (strip + and spaces)
      let targetPhone = phone.replace(/[^0-9]/g, "");
      if (targetPhone.startsWith("0")) {
        targetPhone = "62" + targetPhone.substring(1);
      }

      const method = await SettingService.get("wa_method", "baileys");
      const token = await SettingService.get("wa_token", "");

      let response;
      if (method === "fonnte") {
        const targetUrl = endpoint || "https://api.fonnte.com/send";
        response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token,
          },
          body: JSON.stringify({
            target: targetPhone,
            message: message,
          }),
        });
      } else {
        const targetUrl = endpoint || "http://localhost:5000/send";
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        response = await fetch(targetUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            to: targetPhone,
            message: message,
          }),
        });
      }

      const resData = await response.json();
      if (response.ok && (resData.success || resData.status)) {
        return NextResponse.json({ success: true, message: "Pesan uji coba berhasil dikirim!" });
      } else {
        return NextResponse.json({ error: resData.error || "Gagal mengirim pesan via WhatsApp Gateway. Periksa status koneksi." }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
