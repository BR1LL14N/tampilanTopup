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

    // Doku and Multi-Payment Gateway Settings
    const paymentGateway = await SettingService.get("payment_gateway", "midtrans");
    const paymentMethodType = await SettingService.get("payment_method_type", "checkout"); // checkout vs direct
    const dokuClientId = await SettingService.get("doku_client_id", "");
    const dokuSharedKey = await SettingService.get("doku_shared_key", "");
    const dokuMode = await SettingService.get("doku_mode", "sandbox");

    // WhatsApp Integration Settings
    const waStatus = await SettingService.get("wa_status", "disabled");
    const waMethod = await SettingService.get("wa_method", "baileys");
    const waEndpoint = await SettingService.get("wa_endpoint", "http://localhost:5000/send");
    const waToken = await SettingService.get("wa_token", "");
    const waAdminNumber = await SettingService.get("wa_admin_number", "");
    const waCustomerNotif = await SettingService.get("wa_customer_notif", true);

    // Business Identity Settings
    const businessOwnerName = await SettingService.get("business_owner_name", "");
    const businessLegalName = await SettingService.get("business_legal_name", "");
    const businessAddress = await SettingService.get("business_address", "");
    const businessNpwp = await SettingService.get("business_npwp", "");
    const businessPhone = await SettingService.get("business_phone", "");
    const businessEmail = await SettingService.get("business_email", "");

    // Branding Settings
    const logoUrl = await SettingService.get("logo_url", "");
    const faviconUrl = await SettingService.get("favicon_url", "");

    // Social Media Settings
    const socialInstagram = await SettingService.get("social_instagram", "");
    const socialTiktok = await SettingService.get("social_tiktok", "");
    const socialFacebook = await SettingService.get("social_facebook", "");
    const socialYoutube = await SettingService.get("social_youtube", "");

    return NextResponse.json({
      settings: {
        isSyncActive,
        syncInterval,
        lastSyncTime,
        lastSyncStatus,
        midtransMode,
        paymentGateway,
        paymentMethodType,
        dokuClientId,
        dokuSharedKey,
        dokuMode,
        waStatus,
        waMethod,
        waEndpoint,
        waToken,
        waAdminNumber,
        waCustomerNotif,
        businessOwnerName,
        businessLegalName,
        businessAddress,
        businessNpwp,
        businessPhone,
        businessEmail,
        logoUrl,
        faviconUrl,
        socialInstagram,
        socialTiktok,
        socialFacebook,
        socialYoutube
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
      paymentGateway,
      paymentMethodType,
      dokuClientId,
      dokuSharedKey,
      dokuMode,
      waStatus,
      waMethod,
      waEndpoint,
      waToken,
      waAdminNumber,
      waCustomerNotif,
      businessOwnerName,
      businessLegalName,
      businessAddress,
      businessNpwp,
      businessPhone,
      businessEmail,
      logoUrl,
      faviconUrl,
      socialInstagram,
      socialTiktok,
      socialFacebook,
      socialYoutube
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
    if (paymentGateway !== undefined) {
      await SettingService.set("payment_gateway", String(paymentGateway));
    }
    if (paymentMethodType !== undefined) {
      await SettingService.set("payment_method_type", String(paymentMethodType));
    }
    if (dokuClientId !== undefined) {
      await SettingService.set("doku_client_id", String(dokuClientId));
    }
    if (dokuSharedKey !== undefined) {
      await SettingService.set("doku_shared_key", String(dokuSharedKey));
    }
    if (dokuMode !== undefined) {
      await SettingService.set("doku_mode", String(dokuMode));
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

    // Save Business Identity settings
    if (businessOwnerName !== undefined) {
      await SettingService.set("business_owner_name", String(businessOwnerName));
    }
    if (businessLegalName !== undefined) {
      await SettingService.set("business_legal_name", String(businessLegalName));
    }
    if (businessAddress !== undefined) {
      await SettingService.set("business_address", String(businessAddress));
    }
    if (businessNpwp !== undefined) {
      await SettingService.set("business_npwp", String(businessNpwp));
    }
    if (businessPhone !== undefined) {
      await SettingService.set("business_phone", String(businessPhone));
    }
    if (businessEmail !== undefined) {
      await SettingService.set("business_email", String(businessEmail));
    }

    // Save Branding settings
    if (logoUrl !== undefined) {
      await SettingService.set("logo_url", String(logoUrl));
    }
    if (faviconUrl !== undefined) {
      await SettingService.set("favicon_url", String(faviconUrl));
    }

    // Save Social Media settings
    if (socialInstagram !== undefined) {
      await SettingService.set("social_instagram", String(socialInstagram));
    }
    if (socialTiktok !== undefined) {
      await SettingService.set("social_tiktok", String(socialTiktok));
    }
    if (socialFacebook !== undefined) {
      await SettingService.set("social_facebook", String(socialFacebook));
    }
    if (socialYoutube !== undefined) {
      await SettingService.set("social_youtube", String(socialYoutube));
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
