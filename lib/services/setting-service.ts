import { executeQuery } from "@/lib/db";
import crypto from "crypto";

function getKeyQuote() {
  const provider = process.env.DB_PROVIDER || "mysql";
  return provider === "mysql" ? "`key`" : '"key"';
}

/**
 * Simple in-memory cache per setting key.
 * TTL: 2 menit untuk mengurangi query DB berulang pada key yang sama.
 * Cache otomatis di-invalidate ketika set() dipanggil.
 */
const settingCache = new Map<string, { value: any; expiresAt: number }>();
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 menit

export class SettingService {
  /**
   * Retrieves a setting value by key.
   * Results are cached in-memory for 2 minutes to reduce DB load.
   * Automatically parses JSON strings if applicable.
   */
  static async get<T = any>(key: string, defaultValue: T): Promise<T> {
    const keyQuote = getKeyQuote();
    const now = Date.now();

    // Return from cache if still valid
    const cached = settingCache.get(key);
    if (cached && now < cached.expiresAt) {
      return cached.value as T;
    }

    try {
      const rows = await executeQuery(
        `SELECT value FROM settings WHERE ${keyQuote} = $1 LIMIT 1`,
        [key]
      );

      if (rows.length === 0) {
        // Cache the default value too so we don't hammer DB on missing keys
        settingCache.set(key, { value: defaultValue, expiresAt: now + CACHE_TTL_MS });
        return defaultValue;
      }

      const raw = rows[0].value;
      let parsed: T;

      if (typeof raw === "string") {
        try {
          parsed = JSON.parse(raw) as T;
        } catch {
          parsed = raw as unknown as T;
        }
      } else {
        parsed = raw as T;
      }

      // Store in cache
      settingCache.set(key, { value: parsed, expiresAt: now + CACHE_TTL_MS });
      return parsed;
    } catch (err) {
      console.error(`[SettingService] Error getting key "${key}":`, err);
      return defaultValue;
    }
  }

  /**
   * Updates or inserts a setting key-value pair.
   * Stores the value as a serialized JSON string.
   * Invalidates the in-memory cache for this key immediately.
   */
  static async set(key: string, value: any): Promise<void> {
    const keyQuote = getKeyQuote();
    try {
      const jsonStr = JSON.stringify(value);
      const existing = await executeQuery(
        `SELECT id FROM settings WHERE ${keyQuote} = $1 LIMIT 1`,
        [key]
      );

      if (existing.length > 0) {
        await executeQuery(
          `UPDATE settings SET value = $1 WHERE ${keyQuote} = $2`,
          [jsonStr, key]
        );
      } else {
        const id = crypto.randomUUID();
        await executeQuery(
          `INSERT INTO settings (id, ${keyQuote}, value) VALUES ($1, $2, $3)`,
          [id, key, jsonStr]
        );
      }

      // Invalidate cache for this key so next read gets fresh data
      settingCache.delete(key);
    } catch (err) {
      console.error(`[SettingService] Error setting key "${key}":`, err);
      throw err;
    }
  }

  /**
   * Clears the entire in-memory settings cache.
   * Useful after bulk admin updates.
   */
  static clearCache(): void {
    settingCache.clear();
  }
}
