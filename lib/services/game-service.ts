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

export class GameService {
  /**
   * Retrieves all active games ordered by sort_order.
   */
  static async getAllActive(): Promise<any[]> {
    const sql = `SELECT * FROM games WHERE status = $1 ORDER BY sort_order ASC`;
    return await executeQuery(sql, [true]);
  }

  /**
   * Retrieves a single game by its unique slug.
   */
  static async getBySlug(slug: string): Promise<any | null> {
    const sql = `SELECT * FROM games WHERE slug = $1 LIMIT 1`;
    const rows = await executeQuery(sql, [slug]);
    return rows[0] || null;
  }

  /**
   * Retrieves all games (including inactive ones) for the admin dashboard.
   */
  static async getAll(): Promise<any[]> {
    const sql = `SELECT * FROM games ORDER BY sort_order ASC`;
    return await executeQuery(sql);
  }

  /**
   * Creates a new game.
   */
  static async create(data: GameData): Promise<any> {
    const id = data.id || crypto.randomUUID();
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
      data.status,
      data.sort_order,
      data.image || null
    ]);
    return { id, ...data };
  }

  /**
   * Updates an existing game by ID.
   */
  static async update(id: string, data: Partial<GameData>): Promise<void> {
    // Read current data first to merge partial updates
    const existing = await executeQuery(`SELECT * FROM games WHERE id = $1 LIMIT 1`, [id]);
    if (existing.length === 0) throw new Error("Game not found");
    const current = existing[0];

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
      data.publisher !== undefined ? data.publisher : current.publisher,
      data.status !== undefined ? data.status : current.status,
      data.sort_order !== undefined ? data.sort_order : current.sort_order,
      data.image !== undefined ? data.image : current.image,
      id
    ]);
  }

  /**
   * Deletes a game by ID.
   */
  static async delete(id: string): Promise<void> {
    const sql = `DELETE FROM games WHERE id = $1`;
    await executeQuery(sql, [id]);
  }
}
