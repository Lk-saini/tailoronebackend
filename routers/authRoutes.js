import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

import User from "../model/User.js";
import { sendOtp } from "../utils/sendOtp.js";

const router = express.Router();

// ===== Helpers =====
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");
const compareHashedOtp = (hashedOtpFromDb, plainOtp) => hashOtp(plainOtp) === hashedOtpFromDb;
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "YOUR_SECRET_KEY",
    { expiresIn: process.env.JWT_EXPIRES || "1d" }
  );

// ===== Rate limiter =====
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  message: { message: "Too many requests, try again later." },
});

// ===== Register (send OTP) with pending user handling =====
router.post("/register", otpLimiter, async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email, password required" });

    let user = await User.findOne({ email });

    if (user) {
      if (!user.isVerified) {
        // Update OTP for unverified user
        const otp = generateOtp();
        user.otp = hashOtp(otp);
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await sendOtp(email, otp);

        return res
          .status(200)
          .json({ message: "OTP resent successfully. Verify your email." });
      } else {
        return res.status(400).json({ error: "Email already registered" });
      }
    }

    // Determine role automatically
    let finalRole = "customer"; // default role
    if (email === process.env.ADMIN_EMAIL) {
      finalRole = "admin"; // ✅ Admin email automatically gets admin role
    } else if (role) {
      finalRole = role;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: finalRole,
      otp: otpHash,
      otpExpires,
      isVerified: false,
    });

    await user.save();
    await sendOtp(email, otp);

    res.status(201).json({ message: "User registered. OTP sent for verification." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Verify OTP =====
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.otp || !user.otpExpires)
      return res.status(400).json({ error: "No OTP requested" });
    if (user.otpExpires < new Date())
      return res.status(400).json({ error: "OTP expired" });
    if (!compareHashedOtp(user.otp, otp))
      return res.status(400).json({ error: "Invalid OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Login =====
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    if (!user.isVerified)
      return res.status(400).json({ error: "Account not verified" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = signToken(user);
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Forgot Password (send OTP) =====
router.post("/forget-password", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (user) {
      const otp = generateOtp();
      user.otp = hashOtp(otp);
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendOtp(email, otp);
    }

    res.json({ message: "If an account exists, an OTP has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Reset Password =====
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res
        .status(400)
        .json({ error: "Email, OTP, new password required" });

    const user = await User.findOne({ email });
    if (!user || !user.otp || !user.otpExpires)
      return res.status(400).json({ error: "Invalid request" });
    if (user.otpExpires < new Date())
      return res.status(400).json({ error: "OTP expired" });
    if (!compareHashedOtp(user.otp, otp))
      return res.status(400).json({ error: "Invalid OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
