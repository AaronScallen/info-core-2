import { config } from "dotenv";
import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

config();

async function importData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔄 Starting data import to Neon...");
    console.log(
      `📍 Database: ${
        process.env.DATABASE_URL?.split("@")[1]?.split("?")[0] || "unknown"
      }\n`
    );

    const sqlPath = join(process.cwd(), "data-export.sql");
    console.log(`📄 Reading ${sqlPath}...`);

    const sql = readFileSync(sqlPath, "utf-8");

    console.log("💾 Importing data...\n");

    await pool.query(sql);

    console.log("✅ Import complete!");
    console.log("\nNext steps:");
    console.log("  1. Start your server: npm run dev");
    console.log("  2. Test your API endpoints");
    console.log("  3. Verify data in Neon Console\n");
  } catch (error: any) {
    console.error("❌ Import failed:", error.message);
    if (error.position) {
      console.error(`\nError at position ${error.position} in SQL file`);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importData();
