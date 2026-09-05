// backend/routes/auth.routes.js
// Secure Login/Signup for Q-CAPS.
// Every response that includes user data returns the EXACT shape defined in
// shared_data_schema.md's "Common User Profile" object — this is what
// Niranjan's frontend and Vishnu Priya's backend both expect, so there is
// no separate mapping step needed anywhere else in the app.

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User.model");
const { verify_token } = require("../middleware/authMiddleware");

const router = express.Router();

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "2h";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return typeof password === "string" && password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

function signToken(user) {
  return jwt.sign(
    { user_id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

// Converts a Mongoose User document into EXACTLY the shared_data_schema.md
// "Common User Profile" shape. This is the single place that shape is built —
// every route below calls this instead of hand-assembling JSON, so the
// schema can never drift out of sync across endpoints.
function toPublicProfile(user) {
  return {
    user_id: user._id,
    name: user.name,
    email: user.email,
    readiness_score: user.readiness_score,
    total_xp: user.total_xp,
    global_rank: user.global_rank,
    unlocked_badges: user.unlocked_badges,
    recommended_next_module: user.recommended_next_module,
  };
}

/**
 * POST /api/auth/register
 * body: { name, email, password, role? }
 */
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: "Password must be at least 8 characters and include a letter and a number.",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email may already exist." });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password_hash,
      role: role || "student",
    });

    const token = signToken(newUser);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: toPublicProfile(newUser),
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const genericError = { error: "Invalid email or password." };

    if (!user) {
      return res.status(401).json(genericError);
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json(genericError);
    }

    user.last_login_at = new Date();
    await user.save();

    const token = signToken(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: toPublicProfile(user),
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

/**
 * GET /api/auth/me
 * Protected — returns the logged-in user's profile in the shared schema shape.
 * Header required: Authorization: Bearer <token>
 * This is the endpoint Niranjan's dashboard should call to populate the
 * Common User Profile object directly, with zero remapping on the frontend.
 */
router.get("/me", verify_token, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.status(200).json(toPublicProfile(user));
  } catch (err) {
    console.error("Fetch profile error:", err.message);
    return res.status(500).json({ error: "Something went wrong." });
  }
});

module.exports = router;
