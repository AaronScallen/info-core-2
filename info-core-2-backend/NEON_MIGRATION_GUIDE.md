# Neon DB Migration Guide

This guide will help you migrate your data from PostgreSQL to Neon DB while maintaining full connectivity with your application.

## Prerequisites

- Your current PostgreSQL database is running and accessible
- A Neon account (sign up at https://neon.tech)

## Step 1: Create a Neon Database

1. Go to https://console.neon.tech
2. Create a new project
3. Copy your Neon connection string (it will look like):
   ```
   postgresql://username:password@ep-xxxx-xxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

## Step 2: Install Required Dependencies

```bash
npm install @neondatabase/serverless
```

## Step 3: Update Your Environment Variables

Update your `.env` file with the Neon connection string:

```env
# Database (NeonDB)
DATABASE_URL=postgresql://username:password@ep-xxxx-xxxx.region.aws.neon.tech/neondb?sslmode=require

# Keep your old DATABASE_URL for reference during migration
# OLD_DATABASE_URL=postgresql://postgres:P3pp3r3d!@localhost:5432/info-core
```

## Step 4: Export Data from Current PostgreSQL

Run the export script to dump your current data:

```bash
npm run export:data
```

This will create a `data-export.sql` file with all your data.

## Step 5: Push Schema to Neon DB

Run Drizzle migrations to create the schema in Neon:

```bash
npx drizzle-kit push
```

## Step 6: Import Data to Neon DB

Use the Neon SQL Editor or psql to import your data:

### Option A: Using Neon SQL Editor

1. Go to your Neon Console
2. Navigate to SQL Editor
3. Copy the contents of `data-export.sql`
4. Run the SQL statements

### Option B: Using psql

```bash
psql "postgresql://username:password@ep-xxxx-xxxx.region.aws.neon.tech/neondb?sslmode=require" -f data-export.sql
```

## Step 7: Update Database Connection (Optional - for Neon Serverless)

For optimal performance with Neon, you can use their serverless driver. Update `src/db/index.ts`:

```typescript
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

**Note:** If you prefer to keep using `pg` (node-postgres), your current setup will work fine with Neon. No changes needed to `src/db/index.ts`.

## Step 8: Test the Connection

Start your backend server:

```bash
npm run dev
```

Test your API endpoints to ensure everything works correctly.

## Step 9: Verify Data

Check that all your data has been migrated successfully:

- Users
- Employees
- Assignments
- Bodycams
- Police Vehicles
- Cell Phones
- Absences

## Rollback Plan

If something goes wrong, you can quickly switch back to your local PostgreSQL by:

1. Restoring the old `DATABASE_URL` in your `.env` file
2. Restarting your server

## Benefits of Neon DB

- **Serverless**: Scales to zero when not in use
- **Branching**: Create database branches for development/testing
- **Managed**: No server maintenance required
- **Fast**: Built on separated storage and compute architecture
- **Free Tier**: Generous free tier for development

## Important Notes

- Neon uses PostgreSQL 15+, so all your Drizzle schemas work without changes
- SSL mode is required for Neon connections (automatically handled)
- Connection pooling is built into Neon (no need for pgBouncer)
- Consider using Neon's branching feature for development/staging environments

## Troubleshooting

### Connection Issues

- Ensure your IP is whitelisted in Neon Console (or enable "Allow all IPs")
- Verify the connection string includes `?sslmode=require`

### Data Import Issues

- Check for foreign key constraint violations
- Ensure sequences are properly updated after import
- Verify all tables exist before importing data

### Performance

- Neon may take a few seconds to wake up if your database has been idle
- Consider using connection pooling for production workloads
