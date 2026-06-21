import postgres, { Sql } from "postgres";

// Lazy database connection singleton
let sql: Sql | null = null;

function getDatabase(): Sql {
  if (sql) return sql;

  // Validate required environment variables
  const requiredEnvVars = [
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "POSTGRES_DATABASE",
  ] as const;

  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    console.error("Missing database environment variables:", missing);
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  sql = postgres({
    host: process.env.POSTGRES_HOST!,
    port: parseInt(process.env.POSTGRES_PORT!),
    username: process.env.POSTGRES_USER!,
    password: process.env.POSTGRES_PASSWORD!,
    database: process.env.POSTGRES_DATABASE!,
    ssl: "require",
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return sql;
}

type QueryParam = string | number | boolean | null | undefined;

export async function query<T = unknown>(
  text: string,
  params?: QueryParam[]
): Promise<T[]> {
  try {
    const db = getDatabase();
    const result = await db.unsafe(text, params as (string | number | boolean | null)[] || []);
    return result as unknown as T[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export async function queryOne<T = unknown>(
  text: string,
  params?: QueryParam[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}
