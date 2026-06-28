import mysql from 'mysql2/promise';
import { Pool } from 'pg';

declare global {
  var mysqlPool: mysql.Pool | undefined;
  var pgPool: Pool | undefined;
}

/**
 * Executes a SQL query on the active database provider (MySQL or Supabase PostgreSQL).
 * Normalizes query parameter placeholders automatically (translates $1, $2 to ? for MySQL).
 */
export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const provider = process.env.DB_PROVIDER || 'mysql';
  let formattedSql = sql;
  const formattedParams = [...params];

  if (provider === 'mysql') {
    // Translate PostgreSQL parameters ($1, $2...) to MySQL parameters (?, ?...)
    formattedSql = sql.replace(/\$\d+/g, '?');
    
    // For MySQL, convert boolean parameters (true/false) to 1/0
    // and format ISO 8601 strings to YYYY-MM-DD HH:MM:SS standard datetime
    for (let i = 0; i < formattedParams.length; i++) {
      if (typeof formattedParams[i] === 'boolean') {
        formattedParams[i] = formattedParams[i] ? 1 : 0;
      } else if (typeof formattedParams[i] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(formattedParams[i])) {
        formattedParams[i] = formattedParams[i].slice(0, 19).replace('T', ' ');
      }
    }
  }

  if (provider === 'mysql') {
    if (!globalThis.mysqlPool) {
      globalThis.mysqlPool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'freelance_topup',
        waitForConnections: true,
        connectionLimit: 10,
      });
    }
    const [rows] = await globalThis.mysqlPool.execute(formattedSql, formattedParams);
    return rows as T[];
  } else {
    if (!globalThis.pgPool) {
      globalThis.pgPool = new Pool({
        connectionString: process.env.POSTGRES_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.DATABASE_URL,
      });
    }
    const result = await globalThis.pgPool.query(formattedSql, formattedParams);
    return result.rows as T[];
  }
}
