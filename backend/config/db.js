import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "asadb",
  password: "Jami@2003",
  port: 5432,
});

export default pool;