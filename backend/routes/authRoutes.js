import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from "axios";
import https from "https";

import { Verification_Email_Template, Welcome_Email_Template } 
from "../utils/emailTemplates.js";

const router = express.Router();


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

// SEND OTP
router.post("/send-otp", async (req, res) => {
  console.log("send otp route hit");

  try {

    const { email } = req.body;

    // check if user already exists
    const userExist = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.json({
        success:false,
        message:"User already registered. Please login."
      });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await pool.query(
      "INSERT INTO otp_verification(email, otp, expires_at) VALUES($1,$2,$3)",
      [email, otp, expiry]
    );
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

});

// VERIFY OTP + REGISTER
router.post("/verify-otp", async (req, res) => {

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


    const result = await pool.query(
      "SELECT * FROM otp_verification WHERE email=$1 AND otp=$2",
      [email, otp]
    );


    if (result.rows.length === 0)
      return res.json({ message: "Invalid OTP" });


    const record = result.rows[0];


    if (new Date() > record.expires_at)
      return res.json({ message: "OTP expired" });


    const hashPassword = await bcrypt.hash(password, 10);


    await pool.query(
      `INSERT INTO users(fullname,email,role,mobile,password)
       VALUES($1,$2,$3,$4,$5)`,
      [fullName, email, role, mobile, hashPassword]
    );


    // Delete OTP after use
    await pool.query(
      "DELETE FROM otp_verification WHERE email=$1",
      [email]
    );


    // Send Welcome Email
    await transporter.sendMail({
      from: '"ASA Onboarding Team" <teamasaproject54@gmail.com>',
      to: email,
      subject: "Welcome to ASA Portal",
      html: Welcome_Email_Template(fullName)
    });


    res.json({ message: "User Registered Successfully" });

  } catch (err) {

    console.log(err);
    res.status(500).json(err.message);

  }

});


// LOGIN WITH CAPTCHA
router.post("/login", async (req, res) => {

  try {

    const { email, password, captcha } = req.body;

    // CAPTCHA verification
    const secretKey = "6Lc20X8sAAAAAOjt5oDFxYY31qLAVjN8e3JofLOy";

    const verifyURL =
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

    const response = await axios.post(
  verifyURL,
  {},
  {
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  }
);

    if (!response.data.success) {
      return res.json({ message: "Captcha verification failed" });
    }


    // Check user
    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0)
      return res.json({ message: "User not found" });


    const user = result.rows[0];


    // Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({ message: "Invalid credentials" });


    // Create JWT token
    const token = jwt.sign({ id: user.id }, "6Lc20X8sAAAAAOjt5oDFxYY31qLAVjN8e3JofLOy");


    res.json({
      message: "Login Success",
      token,
      user
    });

  } catch (err) {

    console.log(err);
    res.status(500).json(err.message);

  }

});


export default router;