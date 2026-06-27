const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { Client } = require("pg");

// 1. Baca konfigurasi dari .env.local secara manual
const envPath = path.join(__dirname, "..", ".env.local");
let env = {};

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf-8");
  envFile.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        let val = trimmed.substring(idx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        env[key] = val;
      }
    }
  });
} else {
  console.error("Error: Berkas .env.local tidak ditemukan!");
  process.exit(1);
}

const provider = env.DB_PROVIDER || "mysql";

async function runMigration() {
  console.log(`=== MITSURU DATABASE MIGRATION SYSTEM ===`);
  console.log(`Target Database Provider: ${provider.toUpperCase()}`);

  if (provider === "mysql") {
    const dbName = env.MYSQL_DATABASE || "freelance_topup";
    console.log(`Connecting to MySQL server...`);
    
    let connection;
    try {
      // 1. Koneksi awal ke MySQL tanpa menunjuk database (karena database mungkin belum dibuat)
      connection = await mysql.createConnection({
        host: env.MYSQL_HOST || "localhost",
        port: parseInt(env.MYSQL_PORT || "3306"),
        user: env.MYSQL_USER || "root",
        password: env.MYSQL_PASSWORD || "",
        multipleStatements: true, // Izinkan eksekusi seluruh isi berkas SQL sekaligus
      });
      console.log("✓ Connected to MySQL server successfully.");
    } catch (err) {
      console.error("✗ Gagal terhubung ke MySQL Server. Periksa MYSQL_HOST, USER, & PASSWORD Anda!");
      console.error(err.message);
      process.exit(1);
    }

    try {
      // 2. Buat database jika belum ada
      console.log(`Creating database '${dbName}' if not exists...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await connection.query(`USE \`${dbName}\`;`);
      console.log(`✓ Database '${dbName}' ready.`);

      // 3. Eksekusi Schema
      console.log("Running schema-mysql.sql...");
      const schemaPath = path.join(__dirname, "schema-mysql.sql");
      if (!fs.existsSync(schemaPath)) {
        throw new Error("Berkas schema-mysql.sql tidak ditemukan di folder database!");
      }
      const schemaSql = fs.readFileSync(schemaPath, "utf-8");
      await connection.query(schemaSql);
      console.log("✓ Database schema created successfully.");

      // 4. Eksekusi Seed Data
      console.log("Running seed-mysql.sql...");
      const seedPath = path.join(__dirname, "seed-mysql.sql");
      if (!fs.existsSync(seedPath)) {
        throw new Error("Berkas seed-mysql.sql tidak ditemukan di folder database!");
      }
      const seedSql = fs.readFileSync(seedPath, "utf-8");
      await connection.query(seedSql);
      console.log("✓ Seed data inserted successfully.");
      
      console.log("=== MIGRASI MYSQL SELESAI DENGAN SUKSES ===");
    } catch (err) {
      console.error("✗ Terjadi error selama migrasi MySQL:");
      console.error(err.message);
    } finally {
      if (connection) await connection.end();
    }

  } else {
    // Jalur Supabase (PostgreSQL)
    console.log("Connecting to Supabase PostgreSQL...");
    const client = new Client({
      connectionString: env.POSTGRES_URL || env.NEXT_PUBLIC_SUPABASE_URL || env.DATABASE_URL,
    });

    try {
      await client.connect();
      console.log("✓ Connected to PostgreSQL successfully.");

      // 1. Eksekusi Schema
      console.log("Running schema.sql...");
      const schemaPath = path.join(__dirname, "schema.sql");
      if (!fs.existsSync(schemaPath)) {
        throw new Error("Berkas schema.sql tidak ditemukan di folder database!");
      }
      const schemaSql = fs.readFileSync(schemaPath, "utf-8");
      await client.query(schemaSql);
      console.log("✓ Database schema created successfully.");

      // 2. Eksekusi Seed Data (Bila ada)
      const seedPath = path.join(__dirname, "seed_users.sql");
      if (fs.existsSync(seedPath)) {
        console.log("Running seed_users.sql...");
        const seedSql = fs.readFileSync(seedPath, "utf-8");
        await client.query(seedSql);
        console.log("✓ Seed admin & users created successfully.");
      } else {
        console.log("info: Tidak ada berkas seed_users.sql untuk di-import.");
      }

      console.log("=== MIGRASI POSTGRESQL SELESAI DENGAN SUKSES ===");
    } catch (err) {
      console.error("✗ Terjadi error selama migrasi PostgreSQL:");
      console.error(err.message);
    } finally {
      await client.end();
    }
  }
}

runMigration();
