import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import fs from "fs";
import path from "path";

const SCHEMA_DDL = `
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option VARCHAR(1) NOT NULL,
  explanation TEXT NOT NULL,
  dmaic_phase VARCHAR(32) NOT NULL DEFAULT 'Define',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidate_assignments (
  id SERIAL PRIMARY KEY,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255) NOT NULL,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 40,
  status VARCHAR(32) NOT NULL DEFAULT 'assigned',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_attempts (
  id SERIAL PRIMARY KEY,
  assignment_id INTEGER REFERENCES candidate_assignments(id) ON DELETE SET NULL,
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP NOT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

const databaseUrl = process.env.DATABASE_URL;

// We use node-postgres if a real remote DATABASE_URL is explicitly set (e.g., Neon, Supabase, Vercel Postgres)
const isRemotePostgres =
  Boolean(databaseUrl) &&
  !databaseUrl?.includes("localhost:5432") &&
  !databaseUrl?.includes("127.0.0.1:5432");

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDb?: any;
  __arenaNextJsPglite?: PGlite;
  __arenaInitPromise?: Promise<void>;
};

function getDatabase() {
  if (globalForDb.__arenaNextJsDb) {
    return globalForDb.__arenaNextJsDb;
  }

  if (isRemotePostgres) {
    const pool =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({
        connectionString: databaseUrl,
      });

    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = pool;
    }

    const db = drizzlePg(pool);
    globalForDb.__arenaNextJsDb = db;
    return db;
  }

  // Use embedded PGlite for resilient local execution without external DB dependencies
  const dataDir = path.join(process.cwd(), ".data", "pglite");
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch {
    // Ignore if exists
  }

  const pglite = globalForDb.__arenaNextJsPglite ?? new PGlite(dataDir);
  globalForDb.__arenaNextJsPglite = pglite;

  globalForDb.__arenaInitPromise = (async () => {
    try {
      await pglite.exec(SCHEMA_DDL);
    } catch (err) {
      console.error("PGlite initialization error:", err);
    }
  })();

  const db = drizzlePglite(pglite);
  globalForDb.__arenaNextJsDb = db;
  return db;
}

export const db = getDatabase();
export const pool = globalForDb.__arenaNextJsPostgresqlPool ?? null;

export async function ensureDbReady() {
  if (globalForDb.__arenaInitPromise) {
    await globalForDb.__arenaInitPromise;
  }
}
