import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "asadb",
  password: process.env.DB_PASSWORD || "Jami@2003",
  port: Number(process.env.DB_PORT) || 5432,
});

export default pool;
