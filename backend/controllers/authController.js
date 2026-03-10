import pool, { db } from "../config/db.js";
import { usersTable, otpVerificationTable } from "../config/schema.js";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from "axios";
import https from "https";

import { Verification_Email_Template, Welcome_Email_Template } 
from "../utils/emailTemplates.js";

// EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: "teamasaproject54@gmail.com",
    pass: "jwec oncv vffv ibhn"
  }
});

export const sendOtp = async (req, res) => {
  console.log("send otp route hit");

  try {
    const { email } = req.body;

    // check if user exists in the users table
    const existingUsers = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: "User already exists with this email" });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // Insert or update OTP
    await pool.query( // Using raw query here for ON CONFLICT since drizzle upsert can be slightly tricky without unique constraint on email in OTP table, but wait, let's just delete and insert
      `DELETE FROM otp_verification WHERE email = $1`, [email]
    );

    await db.insert(otpVerificationTable).values({
      email,
      otp,
      expires_at: expiry
    });
    console.log("OTP generated and stored in DB:", otp);

    try {
      const info = await transporter.sendMail({
        from: '"ASA Onboarding Team" <teamasaproject54@gmail.com>',
        to: email,
        subject: "ASA Portal Email Verification OTP",
        html: Verification_Email_Template(otp)
      });
      console.log("Email sent:", info.response);
    } catch (error) {
      console.log("Email error:", error);
    }

    console.log("OTP email sent to:", email);
    res.json({
      success:true,
      message:"OTP sent successfully"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { fullName, email, role, mobile, password, otp } = req.body;

    // STRONG PASSWORD VALIDATION
    const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongPassword.test(password)) {
      return res.json({
        message:
        "Password must contain minimum 8 characters including uppercase, lowercase, number and special character"
      });
    }

    // Verify OTP exists and is valid
    const otpRecords = await db.select()
      .from(otpVerificationTable)
      .where(eq(otpVerificationTable.email, email));

    if (otpRecords.length === 0) {
      return res.status(400).json({ success: false, message: "No OTP requested for this email" });
    }

    const record = otpRecords[0];

    if (record.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    } 
    
    const hashPassword = await bcrypt.hash(password, 10);

    await db.insert(usersTable).values({
      fullname: fullName,
      email: email,
      role: role,
      mobile: mobile,
      password: hashPassword
    });

    // Remove OTP record upon successful verification
    await db.delete(otpVerificationTable)
      .where(eq(otpVerificationTable.email, email));

    // Send Welcome Email
    await transporter.sendMail({
      from: '"ASA Onboarding Team" <teamasaproject54@gmail.com>',
      to: email,
      subject: "Welcome to ASA Portal",
      html: Welcome_Email_Template(fullName)
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login.",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    // CAPTCHA verification
    const secretKey = "6Lc20X8sAAAAAOjt5oDFxYY31qLAVjN8e3JofLOy";
    const verifyURL =
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

    const response = await axios.post(
      verifyURL, {}, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      }
    );

    if (!response.data.success) {
      return res.json({ message: "Captcha verification failed" });
    }

    // Check user
    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = users[0];

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({ message: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign({ id: user.id }, "6Lc20X8sAAAAAOjt5oDFxYY31qLAVjN8e3JofLOy");

    res.json({
      message: "Login Success",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
};
