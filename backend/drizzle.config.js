import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./config/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: "localhost",
    user: "postgres",
    password: "Team2026",
    database: "asadb",
    port: 5433,
    ssl: false,
  },
});
