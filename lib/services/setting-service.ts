import { executeQuery } from "@/lib/db";
import crypto from "crypto";

export class SettingService {
  /**
   * Retrieves a setting value by key.
   * Automatically parses JSON strings if applicable.
   */
  static async get<T = any>(key: string, defaultValue: T): Promise<T> {
    try {
      const rows = await executeQuery("SELECT value FROM settings WHERE `key` = $1 LIMIT 1", [key]);
      if (rows.length === 0) return defaultValue;
      const val = rows[0].value;
      if (typeof val === "string") {
        try {
          return JSON.parse(val) as T;
        } catch {
          return val as unknown as T;
        }
      }
      return val as T;
    } catch (err) {
      console.error(`Error getting setting key ${key}:`, err);
      return defaultValue;
    }
  }

  /**
   * Updates or inserts a setting key-value pair.
   * Stores the value as a serialized JSON string.
   */
  static async set(key: string, value: any): Promise<void> {
    try {
      const jsonStr = JSON.stringify(value);
      const existing = await executeQuery("SELECT id FROM settings WHERE `key` = $1 LIMIT 1", [key]);
      
      if (existing.length > 0) {
        await executeQuery("UPDATE settings SET value = $1 WHERE `key` = $2", [jsonStr, key]);
      } else {
        const id = crypto.randomUUID();
        await executeQuery("INSERT INTO settings (id, `key`, value) VALUES ($1, $2, $3)", [id, key, jsonStr]);
      }
    } catch (err) {
      console.error(`Error setting key ${key}:`, err);
      throw err;
    }
  }
}
