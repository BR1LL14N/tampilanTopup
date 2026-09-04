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
}

let columnsChecked = false;
let hasPublisherColumn = false;

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
    } else {
      try {
        await executeQuery(`ALTER TABLE games ADD COLUMN IF NOT EXISTS publisher VARCHAR(100) NULL DEFAULT 'Gamer'`);
      } catch (_) {}
      try {
        await executeQuery(`ALTER TABLE games ADD COLUMN IF NOT EXISTS image TEXT NULL`);
      } catch (_) {}
    }
  } catch (e) {
    console.error("[GameService] Error altering games table:", e);
  }

  // Check whether publisher column is available in games table
  try {
    const isMysql = (process.env.DB_PROVIDER || "mysql") === "mysql";
    if (isMysql) {
      const cols = await executeQuery(`SHOW COLUMNS FROM games LIKE 'publisher'`);
      hasPublisherColumn = Array.isArray(cols) && cols.length > 0;
    } else {
      const cols = await executeQuery(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'publisher'
      `);
      hasPublisherColumn = Array.isArray(cols) && cols.length > 0;
    }
  } catch (colErr) {
    console.warn("[GameService] Failed to check publisher column existence, defaulting to false:", colErr);
    hasPublisherColumn = false;
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
    }));
  }

  /**
   * Creates a new game.
   */
  static async create(data: GameData): Promise<any> {
    await ensureGamesColumns();
    const id = data.id || crypto.randomUUID();

    if (hasPublisherColumn) {
      const sql = `
        INSERT INTO games (id, name, slug, icon, category, description, publisher, status, sort_order, image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      await executeQuery(sql, [
        id,
        data.name,
        data.slug,
        data.icon || "🎮",
        data.category || "Game",
        data.description || "",
        data.publisher || "Gamer",
        data.status ? true : false,
        data.sort_order || 0,
        data.image || null,
      ]);
    } else {
      const sql = `
        INSERT INTO games (id, name, slug, icon, category, description, status, sort_order, image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      await executeQuery(sql, [
        id,
        data.name,
        data.slug,
        data.icon || "🎮",
        data.category || "Game",
        data.description || "",
        data.status ? true : false,
        data.sort_order || 0,
        data.image || null,
      ]);
    }
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

    if (hasPublisherColumn) {
      const sql = `
        UPDATE games
        SET name = $1, slug = $2, icon = $3, category = $4, description = $5, publisher = $6, status = $7, sort_order = $8, image = $9
        WHERE id = $10
      `;
      await executeQuery(sql, [
        data.name !== undefined ? data.name : current.name,
        data.slug !== undefined ? data.slug : current.slug,
        data.icon !== undefined ? data.icon : current.icon,
        data.category !== undefined ? data.category : current.category,
        data.description !== undefined ? data.description : current.description,
        data.publisher !== undefined ? data.publisher : current.publisher || "Gamer",
        data.status !== undefined ? (data.status ? true : false) : current.status,
        data.sort_order !== undefined ? (data.sort_order || 0) : current.sort_order,
        data.image !== undefined ? data.image : current.image,
        id,
      ]);
    } else {
      const sql = `
        UPDATE games
        SET name = $1, slug = $2, icon = $3, category = $4, description = $5, status = $6, sort_order = $7, image = $8
        WHERE id = $9
      `;
      await executeQuery(sql, [
        data.name !== undefined ? data.name : current.name,
        data.slug !== undefined ? data.slug : current.slug,
        data.icon !== undefined ? data.icon : current.icon,
        data.category !== undefined ? data.category : current.category,
        data.description !== undefined ? data.description : current.description,
        data.status !== undefined ? (data.status ? true : false) : current.status,
        data.sort_order !== undefined ? (data.sort_order || 0) : current.sort_order,
        data.image !== undefined ? data.image : current.image,
        id,
      ]);
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
