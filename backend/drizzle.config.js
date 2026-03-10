import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// ensure env vars are loaded
dotenv.config();

export default defineConfig({
  schema: "./config/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:Team2026@127.0.0.1:5433/asadb",
  },
  verbose: true,
  strict: true,
});
