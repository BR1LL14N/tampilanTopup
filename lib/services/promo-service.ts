import { executeQuery } from "@/lib/db";

export interface PromoData {
  id?: string;
  code: string;
  discount_amount: number;
  discount_percent: number;
  max_uses: number;
  uses_count: number;
  status: boolean;
}

export class PromoService {
  /**
   * Retrieves a promo code by its alphanumeric code.
   */
  static async getByCode(code: string): Promise<any | null> {
    const codeUpper = code.trim().toUpperCase();
    const sql = `SELECT * FROM promo_codes WHERE code = $1 LIMIT 1`;
    const rows = await executeQuery(sql, [codeUpper]);
    return rows[0] || null;
  }

  /**
   * Retrieves all promo codes.
   */
  static async getAll(): Promise<any[]> {
    const sql = `SELECT * FROM promo_codes ORDER BY created_at DESC`;
    return await executeQuery(sql);
  }

  /**
   * Increments the uses count of a promo code by 1.
   */
  static async incrementUsesCount(id: string): Promise<void> {
    const existing = await executeQuery(`SELECT uses_count FROM promo_codes WHERE id = $1 LIMIT 1`, [id]);
    if (existing.length > 0) {
      const newCount = (Number(existing[0].uses_count) || 0) + 1;
      await executeQuery(`UPDATE promo_codes SET uses_count = $1 WHERE id = $2`, [newCount, id]);
    }
  }

  /**
   * Creates a new promo code.
   */
  static async create(data: PromoData): Promise<any> {
    const id = data.id || crypto.randomUUID();
    const sql = `
      INSERT INTO promo_codes (id, code, discount_amount, discount_percent, max_uses, uses_count, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await executeQuery(sql, [
      id,
      data.code.trim().toUpperCase(),
      data.discount_amount || 0,
      data.discount_percent || 0,
      data.max_uses || 100,
      data.uses_count || 0,
      data.status
    ]);
    return { id, ...data };
  }

  /**
   * Updates an existing promo code.
   */
  static async update(id: string, data: Partial<PromoData>): Promise<void> {
    const existing = await executeQuery(`SELECT * FROM promo_codes WHERE id = $1 LIMIT 1`, [id]);
    if (existing.length === 0) throw new Error("Promo code not found");
    const current = existing[0];

    const sql = `
      UPDATE promo_codes
      SET code = $1, discount_amount = $2, discount_percent = $3, max_uses = $4, uses_count = $5, status = $6
      WHERE id = $7
    `;
    await executeQuery(sql, [
      data.code !== undefined ? data.code.trim().toUpperCase() : current.code,
      data.discount_amount !== undefined ? data.discount_amount : current.discount_amount,
      data.discount_percent !== undefined ? data.discount_percent : current.discount_percent,
      data.max_uses !== undefined ? data.max_uses : current.max_uses,
      data.uses_count !== undefined ? data.uses_count : current.uses_count,
      data.status !== undefined ? data.status : current.status,
      id
    ]);
  }

  /**
   * Deletes a promo code.
   */
  static async delete(id: string): Promise<void> {
    const sql = `DELETE FROM promo_codes WHERE id = $1`;
    await executeQuery(sql, [id]);
  }
}
