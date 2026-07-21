import { NextRequest, NextResponse } from "next/server";
import { SettingService } from "@/lib/services/setting-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const waNumber = await SettingService.get("wa_admin_number", "6281234567890");

    // Catatan: NPWP sengaja TIDAK diekspos di endpoint publik ini (data pribadi sensitif)
    const businessOwnerName = await SettingService.get("business_owner_name", "");
    const businessLegalName = await SettingService.get("business_legal_name", "");
    const businessAddress = await SettingService.get("business_address", "");
    const businessPhone = await SettingService.get("business_phone", "");
    const businessEmail = await SettingService.get("business_email", "");

    const logoUrl = await SettingService.get("logo_url", "");
    const faviconUrl = await SettingService.get("favicon_url", "");

    const socialInstagram = await SettingService.get("social_instagram", "");
    const socialTiktok = await SettingService.get("social_tiktok", "");
    const socialFacebook = await SettingService.get("social_facebook", "");
    const socialYoutube = await SettingService.get("social_youtube", "");

    return NextResponse.json({
      wa_admin_number: waNumber,
      business_owner_name: businessOwnerName,
      business_legal_name: businessLegalName,
      business_address: businessAddress,
      business_phone: businessPhone,
      business_email: businessEmail,
      logo_url: logoUrl,
      favicon_url: faviconUrl,
      social_instagram: socialInstagram,
      social_tiktok: socialTiktok,
      social_facebook: socialFacebook,
      social_youtube: socialYoutube
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
