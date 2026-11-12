/**
 * Production DB Seeder — runs schema.sql then seed.sql on the remote database.
 * Usage: node backend/scripts/seed_production.js
 * Requires all DB_* env vars to be set (or use a .env file at project root).
 */
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

async function run() {
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "3306"),
    ssl: { rejectUnauthorized: false },
    multipleStatements: true,
  };

  console.log(`Connecting to ${config.host}:${config.port} as ${config.user}`);
  const conn = await mysql.createConnection(config);

  const dbName = process.env.DB_NAME || "defaultdb";
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
  await conn.query(`USE \`${dbName}\`;`);
  console.log(`Using database: ${dbName}`);

  const schemaPath = path.join(__dirname, "..", "..", "database", "schema.sql");
  // Strip any USE statement so we stay on the correct Aiven database
  const schema = fs.readFileSync(schemaPath, "utf8")
    .replace(/^USE\s+[^;]+;\s*/gim, "");
  console.log("Applying schema (34 tables)...");
  await conn.query(schema);
  console.log("Schema applied.");

  const seedPath = path.join(__dirname, "..", "..", "database", "seed.sql");
  // Strip USE statements so we stay on the correct Aiven database
  const seed = fs.readFileSync(seedPath, "utf8")
    .replace(/^USE\s+[^;]+;\s*/gim, "");
  console.log("Seeding data...");
  await conn.query(seed);
  console.log("Seed complete.");

  await conn.end();
  console.log("Database is ready for production.");
}

run().catch((err) => {
  console.error("Seeder error:", err.message);
  process.exit(1);
});
