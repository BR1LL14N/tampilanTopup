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

    const { action } = await req.json();
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

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
