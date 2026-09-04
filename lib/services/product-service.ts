import { executeQuery } from "@/lib/db";
import crypto from "crypto";

export interface ProductData {
  id?: string;
  game_id: string;
  provider_sku: string;
  name: string;
  description?: string;
  price: number;
  sell_price: number;
  admin_fee?: number;
  status: boolean;
  sort_order: number;
  is_flash_sale?: boolean;
  flash_sale_price?: number | null;
  flash_sale_discount?: number | null;
  flash_sale_stock?: number;
  flash_sale_sold?: number;
  is_manual_price?: boolean;
}

export class ProductService {
  /**
   * Retrieves active products for a specific game ID.
   */
  static async getProductsByGameId(gameId: string): Promise<any[]> {
    const sql = `SELECT * FROM products WHERE game_id = $1 AND status = $2 ORDER BY sort_order ASC`;
    return await executeQuery(sql, [gameId, true]);
  }

  /**
   * Retrieves active products with details joined for a specific game slug.
   */
  static async getProductsByGameSlug(slug: string): Promise<any[]> {
    const sql = `
      SELECT p.*, g.name as game_name, g.slug as game_slug
      FROM products p
      JOIN games g ON p.game_id = g.id
      WHERE g.slug = $1 AND p.status = $2
      ORDER BY p.sort_order ASC
    `;
    return await executeQuery(sql, [slug, true]);
  }

  /**
   * Retrieves a single product by ID.
   */
  static async getById(id: string): Promise<any | null> {
    const sql = `SELECT * FROM products WHERE id = $1 LIMIT 1`;
    const rows = await executeQuery(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Retrieves a single product with full game details joined by ID.
   */
  static async getDetailsById(id: string): Promise<any | null> {
    const sql = `SELECT * FROM product_details WHERE id = $1 LIMIT 1`;
    const rows = await executeQuery(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Retrieves active flash sale products.
   */
  static async getFlashSales(limit: number = 4): Promise<any[]> {
    const safeLimit = Math.max(1, parseInt(String(limit), 10) || 4);
    const sql = `SELECT * FROM product_details WHERE status = $1 AND is_flash_sale = $2 LIMIT ${safeLimit}`;
    return await executeQuery(sql, [true, true]);
  }

  /**
   * Retrieves all product details (for admin panel).
   */
  static async getAllDetails(): Promise<any[]> {
    const sql = `SELECT * FROM product_details ORDER BY sort_order ASC`;
    return await executeQuery(sql);
  }

  /**
   * Creates a new product.
   */
  static async create(data: ProductData): Promise<any> {
    const id = data.id || crypto.randomUUID();
    const sql = `
      INSERT INTO products (
        id, game_id, provider_sku, name, description, price, sell_price, admin_fee,
        status, sort_order, is_flash_sale, flash_sale_price, flash_sale_discount, flash_sale_stock, flash_sale_sold, is_manual_price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `;
    await executeQuery(sql, [
      id,
      data.game_id,
      data.provider_sku,
      data.name,
      data.description || null,
      data.price,
      data.sell_price,
      data.admin_fee || 0,
      data.status,
      data.sort_order,
      data.is_flash_sale ? true : false,
      data.flash_sale_price || null,
      data.flash_sale_discount || null,
      data.flash_sale_stock !== undefined ? data.flash_sale_stock : 100,
      data.flash_sale_sold || 0,
      data.is_manual_price ? true : false
    ]);
    return { id, ...data };
  }

  /**
   * Updates an existing product.
   */
  static async update(id: string, data: Partial<ProductData>): Promise<void> {
    const existing = await executeQuery(`SELECT * FROM products WHERE id = $1 LIMIT 1`, [id]);
    if (existing.length === 0) throw new Error("Product not found");
    const current = existing[0];

    const sql = `
      UPDATE products
      SET game_id = $1, provider_sku = $2, name = $3, description = $4, price = $5, sell_price = $6,
          admin_fee = $7, status = $8, sort_order = $9, is_flash_sale = $10,
          flash_sale_price = $11, flash_sale_discount = $12, flash_sale_stock = $13, flash_sale_sold = $14,
          is_manual_price = $15
      WHERE id = $16
    `;
    await executeQuery(sql, [
      data.game_id !== undefined ? data.game_id : current.game_id,
      data.provider_sku !== undefined ? data.provider_sku : current.provider_sku,
      data.name !== undefined ? data.name : current.name,
      data.description !== undefined ? data.description : current.description,
      data.price !== undefined ? data.price : current.price,
      data.sell_price !== undefined ? data.sell_price : current.sell_price,
      data.admin_fee !== undefined ? data.admin_fee : current.admin_fee,
      data.status !== undefined ? data.status : current.status,
      data.sort_order !== undefined ? data.sort_order : current.sort_order,
      data.is_flash_sale !== undefined ? data.is_flash_sale : current.is_flash_sale,
      data.flash_sale_price !== undefined ? data.flash_sale_price : current.flash_sale_price,
      data.flash_sale_discount !== undefined ? data.flash_sale_discount : current.flash_sale_discount,
      data.flash_sale_stock !== undefined ? data.flash_sale_stock : current.flash_sale_stock,
      data.flash_sale_sold !== undefined ? data.flash_sale_sold : current.flash_sale_sold,
      data.is_manual_price !== undefined ? (data.is_manual_price ? true : false) : current.is_manual_price,
      id
    ]);
  }

  /**
   * Bulk updates status (active/inactive) for selected product IDs or all products.
   */
  static async bulkUpdateStatus(status: boolean, ids?: string[]): Promise<void> {
    const statusVal = status ? true : false;
    if (ids && ids.length > 0) {
      const placeholders = ids.map((_, i) => `$${i + 2}`).join(", ");
      const sql = `UPDATE products SET status = $1 WHERE id IN (${placeholders})`;
      await executeQuery(sql, [statusVal, ...ids]);
    } else {
      const sql = `UPDATE products SET status = $1`;
      await executeQuery(sql, [statusVal]);
    }
  }

  /**
   * Unlocks all manual product prices (sets is_manual_price to false).
   */
  static async unlockAllPrices(): Promise<number> {
    const sql = `UPDATE products SET is_manual_price = $1 WHERE is_manual_price = $2`;
    await executeQuery(sql, [false, true]);
    return 1;
  }

  /**
   * Bulk updates price lock status (is_manual_price) for selected product IDs.
   */
  static async bulkUpdatePriceLock(isLocked: boolean, ids?: string[]): Promise<void> {
    const val = isLocked ? true : false;
    if (ids && ids.length > 0) {
      const placeholders = ids.map((_, i) => `$${i + 2}`).join(", ");
      const sql = `UPDATE products SET is_manual_price = $1 WHERE id IN (${placeholders})`;
      await executeQuery(sql, [val, ...ids]);
    } else {
      const sql = `UPDATE products SET is_manual_price = $1`;
      await executeQuery(sql, [val]);
    }
  }

  /**
   * Toggles or sets price lock for a single product.
   */
  static async togglePriceLock(id: string, isLocked?: boolean): Promise<boolean> {
    const existing = await executeQuery(`SELECT id, is_manual_price FROM products WHERE id = $1 LIMIT 1`, [id]);
    if (existing.length === 0) throw new Error("Product not found");
    const current = !!(existing[0].is_manual_price);
    const nextVal = isLocked !== undefined ? isLocked : !current;
    await executeQuery(`UPDATE products SET is_manual_price = $1 WHERE id = $2`, [nextVal, id]);
    return nextVal;
  }

  /**
   * Deletes a product.
   */
  static async delete(id: string): Promise<void> {
    const sql = `DELETE FROM products WHERE id = $1`;
    await executeQuery(sql, [id]);
  }
}
