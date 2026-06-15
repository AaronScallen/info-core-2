import { config } from "dotenv";
import { Pool } from "pg";

config();

async function resetNeonDB() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔄 Resetting Neon database...");
    console.log(
      `📍 Database: ${
        process.env.DATABASE_URL?.split("@")[1]?.split("?")[0] || "unknown"
      }\n`
    );

    // Get all tables
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    if (result.rows.length === 0) {
      console.log("✅ Database is already empty.");
      return;
    }

    console.log(
      "⚠️  Found existing tables:",
      result.rows.map((r) => r.tablename).join(", ")
    );
    console.log("\n🗑️  Dropping all tables...\n");

    // Drop all tables
    for (const row of result.rows) {
      console.log(`  Dropping ${row.tablename}...`);
      await pool.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
    }

    // Drop the enum if it exists
    await pool.query(`DROP TYPE IF EXISTS "role" CASCADE`);

    console.log("\n✅ Database reset complete!");
    console.log("\nNext steps:");
    console.log("  1. Run: npx drizzle-kit push");
    console.log("  2. Start your server: npm run dev");
    console.log("  3. Create your data via the API");
    console.log(
      "  4. Or restore from local: switch DATABASE_URL to local, export data, then import to Neon\n"
    );
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

resetNeonDB();
