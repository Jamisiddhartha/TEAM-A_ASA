import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import pool from "../config/db.js";
import { Verification_Email_Template, Welcome_Email_Template } from "../utils/emailTemplates.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "asa-portal-secret";
const isProduction = process.env.NODE_ENV === "production";
const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@asa-portal.local";

const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

router.post("/send-otp", async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.email);

  if (!normalizedEmail) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE LOWER(TRIM(email)) = $1", [normalizedEmail]);

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: "User already registered. Please login." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query("DELETE FROM otp_verification WHERE LOWER(TRIM(email)) = $1", [normalizedEmail]);
    await pool.query(
      "INSERT INTO otp_verification(email, otp, expires_at) VALUES($1, $2, $3)",
      [normalizedEmail, otp, expiry]
    );

    try {
      if (!transporter) {
        throw new Error("SMTP_NOT_CONFIGURED");
      }

      await transporter.sendMail({
        from: `\"ASA Onboarding Team\" <${mailFrom}>`,
        to: normalizedEmail,
        subject: "ASA Portal Email Verification OTP",
        html: Verification_Email_Template(otp),
      });

      res.json({ success: true, message: "OTP sent successfully" });
    } catch (mailError) {
      console.error("send-otp mail error", mailError);

      if (!isProduction) {
        // Local/dev fallback so registration flow can continue without SMTP.
        res.json({
          success: true,
          message: `Email service unavailable in local mode. Use this OTP: ${otp}`,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "OTP generated but email delivery failed. Please contact support.",
      });
    }
  } catch (error) {
    console.error("send-otp error", error);
    res.status(500).json({ success: false, message: "Failed to send OTP email" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { fullName, role, mobile, password, otp } = req.body;
  const normalizedEmail = normalizeEmail(req.body.email);

  if (!fullName || !normalizedEmail || !role || !mobile || !password || !otp) {
    return res.status(400).json({ message: "All fields including OTP are required" });
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!strongPassword.test(password)) {
    return res.status(400).json({
      message:
        "Password must contain minimum 8 characters including uppercase, lowercase, number and special character",
    });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE LOWER(TRIM(email)) = $1", [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "User already registered. Please login." });
    }

    const otpResult = await pool.query(
      "SELECT * FROM otp_verification WHERE LOWER(TRIM(email)) = $1 AND otp = $2 ORDER BY created_at DESC LIMIT 1",
      [normalizedEmail, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const record = otpResult.rows[0];
    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertResult = await pool.query(
      `
        INSERT INTO users (fullname, email, role, mobile, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, fullname, email, role, mobile, created_at
      `,
      [fullName, normalizedEmail, role, mobile, hashedPassword]
    );

    await pool.query("DELETE FROM otp_verification WHERE LOWER(TRIM(email)) = $1", [normalizedEmail]);

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `\"ASA Onboarding Team\" <${mailFrom}>`,
          to: normalizedEmail,
          subject: "Welcome to ASA Portal",
          html: Welcome_Email_Template(fullName),
        });
      } catch (mailError) {
        // Registration already succeeded; keep response successful.
        console.error("welcome-email error", mailError);
      }
    }

    const user = insertResult.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "User Registered Successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("verify-otp error", error);
    res.status(500).json({ message: "Verification failed" });
  }
});

router.post("/register", async (req, res) => {
  const { fullName, role, mobile, password } = req.body;
  const normalizedEmail = normalizeEmail(req.body.email);

  if (!fullName || !normalizedEmail || !role || !mobile || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  if (!strongPassword.test(password)) {
    return res.status(400).json({
      message:
        "Password must contain at least 8 characters with uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE LOWER(TRIM(email)) = $1", [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `
        INSERT INTO users (fullname, email, role, mobile, password)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, fullname, email, role, mobile, created_at
      `,
      [fullName, normalizedEmail, role, mobile, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ message: "Registration successful", token, user });
  } catch (error) {
    console.error("register error", error);
    res.status(500).json({ message: "Unable to register user" });
  }
});

router.post("/login", async (req, res) => {
  const normalizedEmail = normalizeEmail(req.body.email);
  const password = req.body.password;

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      `
        SELECT id, fullname, email, role, mobile, password
        FROM users
        WHERE LOWER(TRIM(email)) = $1
        LIMIT 1
      `,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.error("login error", error);
    res.status(500).json({ message: "Unable to login" });
  }
});

export default router;




