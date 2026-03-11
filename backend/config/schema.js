import { pgTable, serial, integer, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  fullname: varchar("fullname", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(), 
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull(),
  mobile: varchar("mobile", { length: 20 }),
  created_at: timestamp("created_at").defaultNow()
});

export const otpVerificationTable = pgTable("otp_verification", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  otp: varchar("otp", { length: 10 }).notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow()
});

export const asaApplicationsTable = pgTable("asa_applications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => usersTable.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 50 }).default("pending"),
  applicant_name: varchar("applicant_name", { length: 255 }),
  applicant_type: varchar("applicant_type", { length: 50 }),
  form_data: jsonb("form_data"),
  submitted_at: timestamp("submitted_at").defaultNow()
});
