import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

let pool: Pool | null = null;
let _db: NodePgDatabase | null = null;

if (databaseUrl && databaseUrl.startsWith("postgresql://") && !databaseUrl.includes("x:x@x")) {
  try {
    pool =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
        max: 5,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 3000,
      });
    globalForDb.__arenaNextJsPostgresqlPool = pool;
    _db = drizzle(pool);
  } catch {
    pool = null;
    _db = null;
  }
}

// Non-null assertion for API routes — they catch errors anyway
// When db is null, API routes return empty arrays (app uses IndexedDB client-side)
export const db = _db as NonNullable<typeof _db>;
export { pool };
export const hasDB = _db !== null;
