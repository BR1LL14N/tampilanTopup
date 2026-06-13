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

    const isSyncActive = await SettingService.get("is_sync_cron_active", true);
    const syncInterval = await SettingService.get("sync_interval_hours", 24);
    const lastSyncTime = await SettingService.get("last_sync_time", "");
    const lastSyncStatus = await SettingService.get("last_sync_status", "idle");

    return NextResponse.json({
      settings: {
        isSyncActive,
        syncInterval,
        lastSyncTime,
        lastSyncStatus
      }
    });
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

    const { isSyncActive, syncInterval } = await req.json();

    if (isSyncActive !== undefined) {
      await SettingService.set("is_sync_cron_active", !!isSyncActive);
    }
    if (syncInterval !== undefined) {
      await SettingService.set("sync_interval_hours", Number(syncInterval));
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
