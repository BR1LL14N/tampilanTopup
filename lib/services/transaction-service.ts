import { executeQuery } from "@/lib/db";

export interface TransactionData {
  id?: string;
  invoice: string;
  user_id?: string | null;
  product_id: string;
  target_id: string;
  target_name?: string | null;
  amount: number;
  discount_amount?: number;
  promo_code_id?: string | null;
  payment_method: string;
  payment_status?: string;
  topup_status?: string;
  qr_string?: string | null;
  payment_url?: string | null;
  expired_at?: string | null;
}

export class TransactionService {
  /**
   * Creates a new transaction entry.
   */
  static async create(data: TransactionData): Promise<any> {
    const id = data.id || crypto.randomUUID();
    const sql = `
      INSERT INTO transactions (
        id, invoice, user_id, product_id, target_id, target_name, amount,
        discount_amount, promo_code_id, payment_method, payment_status,
        topup_status, qr_string, payment_url, expired_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;
    await executeQuery(sql, [
      id,
      data.invoice,
      data.user_id || null,
      data.product_id,
      data.target_id,
      data.target_name || null,
      data.amount,
      data.discount_amount || 0,
      data.promo_code_id || null,
      data.payment_method,
      data.payment_status || "pending",
      data.topup_status || "pending",
      data.qr_string || null,
      data.payment_url || null,
      data.expired_at || null
    ]);
    return { id, ...data };
  }

  /**
   * Retrieves a transaction by its unique invoice code.
   */
  static async getByInvoice(invoice: string): Promise<any | null> {
    const sql = `SELECT * FROM transactions WHERE invoice = $1 LIMIT 1`;
    const rows = await executeQuery(sql, [invoice]);
    return rows[0] || null;
  }

  /**
   * Retrieves a transaction with game and product details joined by invoice code.
   */
  static async getDetailsByInvoice(invoice: string): Promise<any | null> {
    const sql = `
      SELECT t.*, p.name as product_name, g.name as game_name, g.slug as game_slug
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN games g ON p.game_id = g.id
      WHERE t.invoice = $1 LIMIT 1
    `;
    const rows = await executeQuery(sql, [invoice]);
    return rows[0] || null;
  }

  /**
   * Retrieves all transactions associated with a specific user ID.
   */
  static async getByUserId(userId: string): Promise<any[]> {
    const sql = `
      SELECT t.*, p.name as product_name, p.provider_sku, g.name as game_name, g.slug as game_slug
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN games g ON p.game_id = g.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
    `;
    return await executeQuery(sql, [userId]);
  }

  /**
   * Retrieves all transactions for the admin dashboard, dynamically resolving the user table.
   */
  static async getAllDetails(): Promise<any[]> {
    const provider = process.env.DB_PROVIDER || "mysql";
    const userTable = provider === "supabase" ? "user_profiles" : "users";

    const sql = `
      SELECT t.*, p.name as product_name, g.name as game_name, g.slug as game_slug, up.email as user_email
      FROM transactions t
      LEFT JOIN products p ON t.product_id = p.id
      LEFT JOIN games g ON p.game_id = g.id
      LEFT JOIN ${userTable} up ON t.user_id = up.id
      ORDER BY t.created_at DESC
    `;
    return await executeQuery(sql);
  }

  /**
   * Updates the payment and/or topup status of a transaction.
   */
  static async updateStatus(id: string, paymentStatus?: string, topupStatus?: string): Promise<void> {
    const existing = await executeQuery(`SELECT payment_status, topup_status FROM transactions WHERE id = $1 LIMIT 1`, [id]);
    if (existing.length === 0) throw new Error("Transaction not found");
    const current = existing[0];

    const sql = `
      UPDATE transactions
      SET payment_status = $1, topup_status = $2
      WHERE id = $3
    `;
    await executeQuery(sql, [
      paymentStatus !== undefined ? paymentStatus : current.payment_status,
      topupStatus !== undefined ? topupStatus : current.topup_status,
      id
    ]);
  }

  /**
   * Performs a generic update on a transaction record for arbitrary fields.
   */
  static async update(id: string, data: Record<string, any>): Promise<void> {
    const fields = Object.keys(data);
    if (fields.length === 0) return;

    let sql = `UPDATE transactions SET `;
    const params: any[] = [];

    fields.forEach((field, index) => {
      const paramIndex = index + 1;
      sql += `${field} = $${paramIndex}, `;
      params.push(data[field]);
    });

    sql = sql.slice(0, -2); // Remove trailing comma and space
    sql += ` WHERE id = $${fields.length + 1}`;
    params.push(id);

    await executeQuery(sql, params);
  }
}
