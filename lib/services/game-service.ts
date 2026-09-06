import { executeQuery } from "@/lib/db";
import crypto from "crypto";

export interface GameData {
  id?: string;
  name: string;
  slug: string;
  icon?: string;
  category?: string;
  description?: string;
  publisher?: string;
  status: boolean;
  sort_order: number;
  image?: string | null;
  is_popular?: boolean;
}

let columnsChecked = false;
let hasPublisherColumn = false;
let hasIsPopularColumn = false;

async function ensureGamesColumns() {
  if (columnsChecked) return;
  try {
    const isMysql = (process.env.DB_PROVIDER || "mysql") === "mysql";
    if (isMysql) {
      try {
        await executeQuery(`ALTER TABLE games ADD COLUMN publisher VARCHAR(100) NULL DEFAULT 'Gamer'`);
      } catch (_) {}
      try {
        await executeQuery(`ALTER TABLE games ADD COLUMN image TEXT NULL`);
      } catch (_) {}
      try {
        await executeQuery(`ALTER TABLE games ADD COLUMN is_popular TINYINT(1) DEFAULT 0`);
      } catch (_) {}
    } else {
      try {
        await executeQuery(`ALTER TABLE games ADD COLUMN IF NOT EXISTS publisher VARCHAR(100) NULL DEFAULT 'Gamer'`);
      } catch (_) {}
      try {
        await executeQuery(`ALTER TABLE games ADD COLUMN IF NOT EXISTS image TEXT NULL`);
      } catch (_) {}
      try {
        await executeQuery(`ALTER TABLE games ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false`);
      } catch (_) {}
    }
  } catch (e) {
    console.error("[GameService] Error altering games table:", e);
  }

  // Check whether publisher and is_popular columns are available in games table
  try {
    const isMysql = (process.env.DB_PROVIDER || "mysql") === "mysql";
    if (isMysql) {
      const pubCols = await executeQuery(`SHOW COLUMNS FROM games LIKE 'publisher'`);
      hasPublisherColumn = Array.isArray(pubCols) && pubCols.length > 0;
      const popCols = await executeQuery(`SHOW COLUMNS FROM games LIKE 'is_popular'`);
      hasIsPopularColumn = Array.isArray(popCols) && popCols.length > 0;
    } else {
      const cols = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name IN ('publisher', 'is_popular')
      `);
      const names = Array.isArray(cols) ? cols.map((c: any) => c.column_name) : [];
      hasPublisherColumn = names.includes("publisher");
      hasIsPopularColumn = names.includes("is_popular");
    }
  } catch (colErr) {
    console.warn("[GameService] Failed to check columns existence:", colErr);
    hasPublisherColumn = false;
    hasIsPopularColumn = false;
  }

  columnsChecked = true;
}

export class GameService {
  /**
   * Retrieves all active games ordered by sort_order.
   */
  static async getAllActive(): Promise<any[]> {
    await ensureGamesColumns();
    const sql = `SELECT * FROM games WHERE status = $1 ORDER BY sort_order ASC`;
    const rows = await executeQuery(sql, [true]);
    return rows.map((r: any) => ({
      ...r,
      status: Boolean(r.status),
      is_popular: Boolean(r.is_popular),
    }));
  }

  /**
   * Retrieves a single game by its unique slug.
   */
  static async getBySlug(slug: string): Promise<any | null> {
    await ensureGamesColumns();
    const sql = `SELECT * FROM games WHERE slug = $1 LIMIT 1`;
    const rows = await executeQuery(sql, [slug]);
    if (!rows[0]) return null;
    return {
      ...rows[0],
      status: Boolean(rows[0].status),
      is_popular: Boolean(rows[0].is_popular),
    };
  }

  /**
   * Retrieves all games (including inactive ones) for the admin dashboard.
   */
  static async getAll(): Promise<any[]> {
    await ensureGamesColumns();
    const sql = `SELECT * FROM games ORDER BY sort_order ASC`;
    const rows = await executeQuery(sql);
    return rows.map((r: any) => ({
      ...r,
      status: Boolean(r.status),
      is_popular: Boolean(r.is_popular),
    }));
  }

  /**
   * Creates a new game.
   */
  static async create(data: GameData): Promise<any> {
    await ensureGamesColumns();
    const id = data.id || crypto.randomUUID();

    const cols = ["id", "name", "slug", "icon", "category", "description", "status", "sort_order", "image"];
    const vals: any[] = [
      id,
      data.name,
      data.slug,
      data.icon || "🎮",
      data.category || "Game",
      data.description || "",
      data.status ? true : false,
      data.sort_order || 0,
      data.image || null,
    ];

    if (hasPublisherColumn) {
      cols.push("publisher");
      vals.push(data.publisher || "Gamer");
    }
    if (hasIsPopularColumn) {
      cols.push("is_popular");
      vals.push(data.is_popular ? 1 : 0);
    }

    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const sql = `INSERT INTO games (${cols.join(", ")}) VALUES (${placeholders})`;
    await executeQuery(sql, vals);
    return { id, ...data };
  }

  /**
   * Updates an existing game by ID.
   */
  static async update(id: string, data: Partial<GameData>): Promise<void> {
    await ensureGamesColumns();
    const existing = await executeQuery(`SELECT * FROM games WHERE id = $1 LIMIT 1`, [id]);
    if (existing.length === 0) throw new Error("Game not found");
    const current = existing[0];

    const updates: string[] = [];
    const vals: any[] = [];
    let idx = 1;

    if (data.name !== undefined) { updates.push(`name = $${idx++}`); vals.push(data.name); }
    if (data.slug !== undefined) { updates.push(`slug = $${idx++}`); vals.push(data.slug); }
    if (data.icon !== undefined) { updates.push(`icon = $${idx++}`); vals.push(data.icon); }
    if (data.category !== undefined) { updates.push(`category = $${idx++}`); vals.push(data.category); }
    if (data.description !== undefined) { updates.push(`description = $${idx++}`); vals.push(data.description); }
    if (data.status !== undefined) { updates.push(`status = $${idx++}`); vals.push(data.status ? 1 : 0); }
    if (data.sort_order !== undefined) { updates.push(`sort_order = $${idx++}`); vals.push(data.sort_order || 0); }
    if (data.image !== undefined) { updates.push(`image = $${idx++}`); vals.push(data.image); }
    if (hasPublisherColumn && data.publisher !== undefined) { updates.push(`publisher = $${idx++}`); vals.push(data.publisher); }
    if (hasIsPopularColumn && data.is_popular !== undefined) { updates.push(`is_popular = $${idx++}`); vals.push(data.is_popular ? 1 : 0); }

    if (updates.length > 0) {
      vals.push(id);
      const sql = `UPDATE games SET ${updates.join(", ")} WHERE id = $${idx}`;
      await executeQuery(sql, vals);
    }
  }

  /**
   * Deletes a game by ID.
   */
  static async delete(id: string): Promise<void> {
    await ensureGamesColumns();
    const sql = `DELETE FROM games WHERE id = $1`;
    await executeQuery(sql, [id]);
  }
}
