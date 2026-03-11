import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "asadb",
  password: "Team2026",
  port: 5433,
});

export default pool;