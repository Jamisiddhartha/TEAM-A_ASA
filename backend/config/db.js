import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
const { Pool } = pg;

// Standard Postgres pool connection
const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "asadb",
  password: "Team2026",
  port: 5433,
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL Database");
});

// Wrap the pool with Drizzle ORM
export const db = drizzle(pool, { schema });

// Export the raw pool for explicit raw SQL fallbacks, if needed
export default pool;