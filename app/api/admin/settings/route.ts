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
    const midtransMode = await SettingService.get("midtrans_mode", "sandbox");

    // WhatsApp Integration Settings
    const waStatus = await SettingService.get("wa_status", "disabled");
    const waMethod = await SettingService.get("wa_method", "baileys");
    const waEndpoint = await SettingService.get("wa_endpoint", "http://localhost:5000/send");
    const waToken = await SettingService.get("wa_token", "");
    const waAdminNumber = await SettingService.get("wa_admin_number", "");
    const waCustomerNotif = await SettingService.get("wa_customer_notif", true);

    return NextResponse.json({
      settings: {
        isSyncActive,
        syncInterval,
        lastSyncTime,
        lastSyncStatus,
        midtransMode,
        waStatus,
        waMethod,
        waEndpoint,
        waToken,
        waAdminNumber,
        waCustomerNotif
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

    const { 
      isSyncActive, 
      syncInterval, 
      midtransMode,
      waStatus,
      waMethod,
      waEndpoint,
      waToken,
      waAdminNumber,
      waCustomerNotif
    } = await req.json();

    if (isSyncActive !== undefined) {
      await SettingService.set("is_sync_cron_active", !!isSyncActive);
    }
    if (syncInterval !== undefined) {
      await SettingService.set("sync_interval_hours", Number(syncInterval));
    }
    if (midtransMode !== undefined) {
      await SettingService.set("midtrans_mode", String(midtransMode));
    }
    
    // Save WhatsApp settings
    if (waStatus !== undefined) {
      await SettingService.set("wa_status", String(waStatus));
    }
    if (waMethod !== undefined) {
      await SettingService.set("wa_method", String(waMethod));
    }
    if (waEndpoint !== undefined) {
      await SettingService.set("wa_endpoint", String(waEndpoint));
    }
    if (waToken !== undefined) {
      await SettingService.set("wa_token", String(waToken));
    }
    if (waAdminNumber !== undefined) {
      await SettingService.set("wa_admin_number", String(waAdminNumber));
    }
    if (waCustomerNotif !== undefined) {
      await SettingService.set("wa_customer_notif", !!waCustomerNotif);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
