import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "asadb",
  password: "Team@2026",
  port: 5432,
});

export default pool;