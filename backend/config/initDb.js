import pool from "./db.js";
import { STEP5_CHECKLIST_TEMPLATE } from "./step5Checklist.js";

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
    CREATE TABLE IF NOT EXISTS application_step4_actions (
      id SERIAL PRIMARY KEY,
      application_id INT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
      submitted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      asa_agreement_ref TEXT,
      pbg_ref TEXT,
      asa_agreement_file_path TEXT,
      asa_agreement_file_name TEXT,
      pbg_file_path TEXT,
      pbg_file_name TEXT,
      remarks TEXT,
      review_status VARCHAR(30) NOT NULL DEFAULT 'pending',
      review_remarks TEXT,
      reviewed_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE application_step4_actions
    ADD COLUMN IF NOT EXISTS asa_agreement_file_path TEXT,
    ADD COLUMN IF NOT EXISTS asa_agreement_file_name TEXT,
    ADD COLUMN IF NOT EXISTS pbg_file_path TEXT,
    ADD COLUMN IF NOT EXISTS pbg_file_name TEXT
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS application_step5_actions (
      id SERIAL PRIMARY KEY,
      application_id INT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
      assigned_auditor_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      audit_status VARCHAR(30) NOT NULL DEFAULT 'pending',
      auditor_summary TEXT,
      applicant_summary TEXT,
      started_at TIMESTAMP,
      submitted_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS application_step5_checklist_items (
      id SERIAL PRIMARY KEY,
      application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
      control_no INT NOT NULL,
      section_code VARCHAR(10) NOT NULL,
      section_title TEXT NOT NULL,
      short_title TEXT NOT NULL,
      control_description TEXT NOT NULL,
      compliance_status VARCHAR(30) NOT NULL DEFAULT 'pending',
      auditor_observation TEXT,
      asa_management_comment TEXT,
      evidence_reference TEXT,
      updated_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (application_id, control_no)
    )
  `);

  await pool.query(`
    ALTER TABLE application_step5_actions
    ADD COLUMN IF NOT EXISTS assigned_auditor_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS audit_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS auditor_summary TEXT,
    ADD COLUMN IF NOT EXISTS applicant_summary TEXT,
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP
  `);

  await pool.query(`
    ALTER TABLE application_step5_checklist_items
    ADD COLUMN IF NOT EXISTS compliance_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS auditor_observation TEXT,
    ADD COLUMN IF NOT EXISTS asa_management_comment TEXT,
    ADD COLUMN IF NOT EXISTS evidence_reference TEXT,
    ADD COLUMN IF NOT EXISTS updated_by_user_id INT REFERENCES users(id) ON DELETE SET NULL
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS application_step6_actions (
      id SERIAL PRIMARY KEY,
      application_id INT NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
      submitted_by_auditor_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      audit_report_ref TEXT,
      artefacts_ref TEXT,
      audit_report_file_path TEXT,
      audit_report_file_name TEXT,
      artefacts_file_path TEXT,
      artefacts_file_name TEXT,
      submission_remarks TEXT,
      review_status VARCHAR(30) NOT NULL DEFAULT 'pending',
      review_remarks TEXT,
      reviewed_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
      submitted_at TIMESTAMP,
      reviewed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE application_step6_actions
    ADD COLUMN IF NOT EXISTS submitted_by_auditor_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS audit_report_ref TEXT,
    ADD COLUMN IF NOT EXISTS artefacts_ref TEXT,
    ADD COLUMN IF NOT EXISTS audit_report_file_path TEXT,
    ADD COLUMN IF NOT EXISTS audit_report_file_name TEXT,
    ADD COLUMN IF NOT EXISTS artefacts_file_path TEXT,
    ADD COLUMN IF NOT EXISTS artefacts_file_name TEXT,
    ADD COLUMN IF NOT EXISTS submission_remarks TEXT,
    ADD COLUMN IF NOT EXISTS review_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS review_remarks TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP
  `);

  for (const item of STEP5_CHECKLIST_TEMPLATE) {
    await pool.query(
      `
        INSERT INTO application_step5_checklist_items (
          application_id,
          control_no,
          section_code,
          section_title,
          short_title,
          control_description
        )
        SELECT a.id, $1, $2, $3, $4, $5
        FROM applications a
        WHERE NOT EXISTS (
          SELECT 1
          FROM application_step5_checklist_items i
          WHERE i.application_id = a.id AND i.control_no = $1
        )
      `,
      [item.controlNo, item.sectionCode, item.sectionTitle, item.shortTitle, item.controlDescription]
    );
  }

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

      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'application_step4_actions_set_updated_at') THEN
        CREATE TRIGGER application_step4_actions_set_updated_at
        BEFORE UPDATE ON application_step4_actions
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at_timestamp();
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'application_step5_actions_set_updated_at') THEN
        CREATE TRIGGER application_step5_actions_set_updated_at
        BEFORE UPDATE ON application_step5_actions
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at_timestamp();
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'application_step5_checklist_items_set_updated_at') THEN
        CREATE TRIGGER application_step5_checklist_items_set_updated_at
        BEFORE UPDATE ON application_step5_checklist_items
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at_timestamp();
      END IF;

      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'application_step6_actions_set_updated_at') THEN
        CREATE TRIGGER application_step6_actions_set_updated_at
        BEFORE UPDATE ON application_step6_actions
        FOR EACH ROW
        EXECUTE FUNCTION set_updated_at_timestamp();
      END IF;
    END $$;
  `);
}