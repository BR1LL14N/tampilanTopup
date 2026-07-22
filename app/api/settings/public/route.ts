import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

/**
 * In-memory cache untuk settings publik.
 * Settings sangat jarang berubah, cukup di-cache 5 menit.
 * Ini menggantikan 12 query DB terpisah menjadi 1 query saja per interval.
 */
let settingsCache: Record<string, string> | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 menit

const PUBLIC_KEYS = [
  "wa_admin_number",
  "business_owner_name",
  "business_legal_name",
  "business_address",
  "business_phone",
  "business_email",
  "logo_url",
  "favicon_url",
  "social_instagram",
  "social_tiktok",
  "social_facebook",
  "social_youtube",
];

function parseValue(raw: string): any {
  if (typeof raw !== "string") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function fetchSettingsFromDB(): Promise<Record<string, string>> {
  const provider = process.env.DB_PROVIDER || "mysql";

  let rows: Array<{ key: string; value: string }> = [];

  if (provider === "mysql") {
    // MySQL: gunakan IN (?, ?, ...) dengan placeholder ?
    const placeholders = PUBLIC_KEYS.map(() => "?").join(", ");
    rows = await executeQuery<{ key: string; value: string }>(
      `SELECT \`key\`, value FROM settings WHERE \`key\` IN (${placeholders})`,
      PUBLIC_KEYS
    );
  } else {
    // PostgreSQL: gunakan IN ($1, $2, ...) dengan placeholder $n
    const placeholders = PUBLIC_KEYS.map((_, i) => `$${i + 1}`).join(", ");
    rows = await executeQuery<{ key: string; value: string }>(
      `SELECT "key", value FROM settings WHERE "key" IN (${placeholders})`,
      PUBLIC_KEYS
    );
  }

  // Ubah array rows menjadi object map key → parsed value
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = parseValue(row.value);
  }
  return map;
}

export async function GET() {
  try {
    const now = Date.now();

    // Gunakan cache jika masih valid
    if (settingsCache && now < cacheExpiresAt) {
      return NextResponse.json(buildResponse(settingsCache), {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          "X-Cache": "HIT",
        },
      });
    }

    // Cache expired atau belum ada — ambil dari DB (1 query saja)
    const data = await fetchSettingsFromDB();

    // Simpan ke in-memory cache
    settingsCache = data;
    cacheExpiresAt = now + CACHE_TTL_MS;

    return NextResponse.json(buildResponse(data), {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Cache": "MISS",
      },
    });
  } catch (err: any) {
    console.error("[settings/public] Error fetching settings:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function buildResponse(data: Record<string, string>) {
  return {
    wa_admin_number:      data["wa_admin_number"]      ?? "6285856457892",
    business_owner_name:  data["business_owner_name"]  ?? "",
    business_legal_name:  data["business_legal_name"]  ?? "",
    business_address:     data["business_address"]     ?? "",
    business_phone:       data["business_phone"]       ?? "",
    business_email:       data["business_email"]       ?? "",
    logo_url:             data["logo_url"]             ?? "",
    favicon_url:          data["favicon_url"]          ?? "",
    social_instagram:     data["social_instagram"]     ?? "",
    social_tiktok:        data["social_tiktok"]        ?? "",
    social_facebook:      data["social_facebook"]      ?? "",
    social_youtube:       data["social_youtube"]       ?? "",
  };
}
