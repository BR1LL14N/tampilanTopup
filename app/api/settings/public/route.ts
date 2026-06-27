import { NextRequest, NextResponse } from "next/server";
import { SettingService } from "@/lib/services/setting-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const waNumber = await SettingService.get("wa_admin_number", "6281234567890");
    return NextResponse.json({
      wa_admin_number: waNumber
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
