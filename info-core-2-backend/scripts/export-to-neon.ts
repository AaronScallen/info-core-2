import { config } from "dotenv";
import { Pool } from "pg";
import { createWriteStream } from "fs";
import { join } from "path";

config();

async function exportData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("🔄 Starting database export...");
    console.log(
      `📍 Using database: ${
        process.env.DATABASE_URL?.split("@")[1]?.split("?")[0] || "unknown"
      }\n`
    );

    // Check if tables exist
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    if (tableCheck.rows.length === 0) {
      console.error("❌ No tables found in database!");
      console.error("\n⚠️  Your database appears to be empty.");
      console.error("Please run the following commands first:");
      console.error("  1. npx drizzle-kit push    (to create tables)");
      console.error("  2. npm run dev              (to start the server)");
      console.error("  3. Create some data via your API");
      console.error("  4. Then run: npm run export:data\n");
      process.exit(1);
    }

    console.log(
      "✅ Found tables:",
      tableCheck.rows.map((r) => r.table_name).join(", ")
    );
    console.log("");

    const outputPath = join(process.cwd(), "data-export.sql");
    const stream = createWriteStream(outputPath);

    // Write header
    stream.write("-- Data export from PostgreSQL\n");
    stream.write("-- Generated: " + new Date().toISOString() + "\n\n");
    stream.write("BEGIN;\n\n");

    // Note: Don't use session_replication_role as it's not allowed in Neon
    // Instead, we'll just insert data normally

    // Export data for each table
    const tables = [
      { name: "users", orderBy: "id" },
      { name: "assignments", orderBy: "assignment_id" },
      { name: "bodycams", orderBy: "bwc_id" },
      { name: "police_vehicles", orderBy: "veh_id" },
      { name: "cell_phones", orderBy: "phone_id" },
      { name: "employees", orderBy: "enumber" },
      { name: "absences", orderBy: "absence_id" },
    ];

    for (const table of tables) {
      // Check if table exists in this database
      const exists = tableCheck.rows.some((r) => r.table_name === table.name);
      if (!exists) {
        console.log(`⚠️  Table ${table.name} not found, skipping...`);
        continue;
      }

      console.log(`📦 Exporting ${table.name}...`);
      const result = await pool.query(
        `SELECT * FROM ${table.name} ORDER BY ${table.orderBy}`
      );

      if (result.rows.length > 0) {
        stream.write(`-- Data for table: ${table.name}\n`);

        for (const row of result.rows) {
          const columns = Object.keys(row);
          const values = columns.map((col) => {
            const val = row[col];
            if (val === null) return "NULL";
            if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === "boolean") return val ? "true" : "false";
            return val;
          });

          stream.write(
            `INSERT INTO ${table.name} (${columns.join(
              ", "
            )}) VALUES (${values.join(", ")});\n`
          );
        }

        stream.write("\n");
        console.log(
          `✅ Exported ${result.rows.length} rows from ${table.name}`
        );
      } else {
        console.log(`⚠️  No data found in ${table.name}`);
      }
    }

    // Update sequences
    stream.write("-- Update sequences\n");
    stream.write(
      "SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));\n"
    );
    stream.write(
      "SELECT setval('assignments_assignment_id_seq', (SELECT COALESCE(MAX(assignment_id), 1) FROM assignments));\n"
    );
    stream.write(
      "SELECT setval('cell_phones_phone_id_seq', (SELECT COALESCE(MAX(phone_id), 1) FROM cell_phones));\n"
    );
    stream.write(
      "SELECT setval('absences_absence_id_seq', (SELECT COALESCE(MAX(absence_id), 1) FROM absences));\n"
    );
    stream.write("\n");

    stream.write("COMMIT;\n");
    stream.end();

    await new Promise((resolve) => stream.on("finish", resolve));

    console.log("\n✨ Export complete!");
    console.log(`📄 Data saved to: ${outputPath}`);
    console.log("\nNext steps:");
    console.log("1. Create your Neon database");
    console.log("2. Run: npx drizzle-kit push");
    console.log("3. Import the data using psql or Neon SQL Editor");
  } catch (error) {
    console.error("❌ Export failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

exportData();
