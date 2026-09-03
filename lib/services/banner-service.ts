import { executeQuery } from "@/lib/db";
import crypto from "crypto";

export interface BannerData {
  id?: string;
  title?: string | null;
  image_url: string;
  mobile_image_url?: string | null;
  link_url?: string | null;
  status: boolean;
  sort_order: number;
}

let tableEnsured = false;

async function ensureBannersTable() {
  if (tableEnsured) return;
  try {
    const isMysql = (process.env.DB_PROVIDER || "mysql") === "mysql";
    if (isMysql) {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS banners (
          id VARCHAR(36) PRIMARY KEY,
          title VARCHAR(255) NULL,
          image_url TEXT NOT NULL,
          mobile_image_url TEXT NULL,
          link_url VARCHAR(255) NULL,
          status TINYINT(1) NOT NULL DEFAULT 1,
          sort_order INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } else {
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS banners (
          id VARCHAR(36) PRIMARY KEY,
          title VARCHAR(255) NULL,
          image_url TEXT NOT NULL,
          mobile_image_url TEXT NULL,
          link_url VARCHAR(255) NULL,
          status BOOLEAN NOT NULL DEFAULT TRUE,
          sort_order INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }

    // Attempt to add mobile_image_url column if table already existed without it
    try {
      await executeQuery(`ALTER TABLE banners ADD COLUMN mobile_image_url TEXT NULL`);
    } catch (_) {
      // Column already exists
    }

    // Seed default hero banners if table is completely empty
    const countRows = await executeQuery(`SELECT COUNT(*) as count FROM banners`);
    const count = Number(countRows[0]?.count ?? countRows[0]?.COUNT ?? 0);

    if (count === 0) {
      const defaultBanners = [
        {
          id: crypto.randomUUID(),
          title: "Mitsuru Top Up Hub",
          image_url: "/assets/hero/banner1.png",
          link_url: "/games/mobile-legends",
          status: true,
          sort_order: 1,
        },
        {
          id: crypto.randomUUID(),
          title: "Promo Top Up Game Termurah",
          image_url: "/assets/hero/banner2.png",
          link_url: "/games/free-fire",
          status: true,
          sort_order: 2,
        },
        {
          id: crypto.randomUUID(),
          title: "Layanan Top Up Game 24 Jam Instan",
          image_url: "/assets/hero/banner3.png",
          link_url: "/games/pubg-mobile",
          status: true,
          sort_order: 3,
        },
      ];

      for (const b of defaultBanners) {
        await executeQuery(
          `INSERT INTO banners (id, title, image_url, link_url, status, sort_order) VALUES ($1, $2, $3, $4, $5, $6)`,
          [b.id, b.title, b.image_url, b.link_url, b.status, b.sort_order]
        );
      }
    }

    tableEnsured = true;
  } catch (err) {
    console.error("[BannerService] Error ensuring banners table:", err);
  }
}

export class BannerService {
  /**
   * Get all active banners ordered by sort_order.
   */
  static async getAllActive(): Promise<any[]> {
    await ensureBannersTable();
    const sql = `SELECT * FROM banners WHERE status = $1 ORDER BY sort_order ASC, created_at DESC`;
    const rows = await executeQuery(sql, [true]);
    return rows.map((r: any) => ({
      ...r,
      status: Boolean(r.status),
    }));
  }

  /**
   * Get all banners (active and inactive) for admin CRUD.
   */
  static async getAll(): Promise<any[]> {
    await ensureBannersTable();
    const sql = `SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC`;
    const rows = await executeQuery(sql);
    return rows.map((r: any) => ({
      ...r,
      status: Boolean(r.status),
    }));
  }

  /**
   * Create a new banner.
   */
  static async create(data: BannerData): Promise<any> {
    await ensureBannersTable();
    const id = data.id || crypto.randomUUID();
    const sql = `
      INSERT INTO banners (id, title, image_url, mobile_image_url, link_url, status, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await executeQuery(sql, [
      id,
      data.title || null,
      data.image_url,
      data.mobile_image_url || null,
      data.link_url || null,
      data.status ? true : false,
      data.sort_order || 0,
    ]);
    return { id, ...data };
  }

  /**
   * Update an existing banner.
   */
  static async update(id: string, data: Partial<BannerData>): Promise<void> {
    await ensureBannersTable();
    const sql = `
      UPDATE banners
      SET title = $1, image_url = $2, mobile_image_url = $3, link_url = $4, status = $5, sort_order = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `;
    await executeQuery(sql, [
      data.title || null,
      data.image_url,
      data.mobile_image_url !== undefined ? data.mobile_image_url : null,
      data.link_url || null,
      data.status ? true : false,
      data.sort_order || 0,
      id,
    ]);
  }

  /**
   * Delete a banner by ID.
   */
  static async delete(id: string): Promise<void> {
    await ensureBannersTable();
    const sql = `DELETE FROM banners WHERE id = $1`;
    await executeQuery(sql, [id]);
  }
}
