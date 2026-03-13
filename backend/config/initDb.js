import pool from "./db.js";

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      fullname VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      role VARCHAR(80) NOT NULL,
      mobile VARCHAR(30) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS otp_verification (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      otp VARCHAR(10) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      application_id VARCHAR(30) UNIQUE,
      organization_name VARCHAR(255) NOT NULL,
      applicant_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      mobile VARCHAR(30) NOT NULL,
      organization_type VARCHAR(120) NOT NULL,
      integration_model VARCHAR(120) NOT NULL,
      current_step INT NOT NULL DEFAULT 2 CHECK (current_step BETWEEN 1 AND 11),
      overall_status VARCHAR(120) NOT NULL DEFAULT 'Application ID Generated',
      environment_status VARCHAR(120) NOT NULL DEFAULT 'Documentation Intake',
      application_summary TEXT,
      created_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS created_by_user_id INT REFERENCES users(id) ON DELETE SET NULL
  `);

  await pool.query(`
    DO $$
    DECLARE
      constraint_name TEXT;
    BEGIN
      SELECT con.conname INTO constraint_name
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE rel.relname = 'applications'
        AND nsp.nspname = 'public'
        AND con.contype = 'c'
        AND pg_get_constraintdef(con.oid) ILIKE '%current_step%';

      IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE applications DROP CONSTRAINT %I', constraint_name);
      END IF;

      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE rel.relname = 'applications'
          AND nsp.nspname = 'public'
          AND con.conname = 'applications_current_step_check'
      ) THEN
        ALTER TABLE applications
        ADD CONSTRAINT applications_current_step_check
        CHECK (current_step BETWEEN 1 AND 11);
      END IF;
    END $$;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS application_form_submissions (
      id SERIAL PRIMARY KEY,
      application_id INT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
      submitted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS application_step3_actions (
      id SERIAL PRIMARY KEY,
      application_id INT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
      issued_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      remarks TEXT,
      appendices JSONB NOT NULL DEFAULT '[]'::jsonb,
      issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);


  await pool.query(`
    CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'applications_set_updated_at') THEN
        CREATE TRIGGER applications_set_updated_at
        BEFORE UPDATE ON applications
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at_timestamp();
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'application_form_submissions_set_updated_at') THEN
        CREATE TRIGGER application_form_submissions_set_updated_at
        BEFORE UPDATE ON application_form_submissions
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at_timestamp();
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'application_step3_actions_set_updated_at') THEN
        CREATE TRIGGER application_step3_actions_set_updated_at
        BEFORE UPDATE ON application_step3_actions
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at_timestamp();
      END IF;
    END $$;
  `);
}

