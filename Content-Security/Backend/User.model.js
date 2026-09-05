// backend/models/User.model.js
//
// Field names in this schema deliberately match shared_data_schema.md's
// "Common User Profile" object EXACTLY (snake_case, same names) so that
// no transform/mapping layer is needed before sending data to Niranjan's
// frontend. This avoids the exact bug the team's own schema doc warns about
// (e.g. "unlocked_badges" vs "badges" mismatches).
//
// Passwords are NEVER stored in plaintext — see auth.routes.js for bcrypt hashing.

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // --- Auth fields (not part of the public schema, internal only) ---
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password_hash: {
      type: String,
      required: true, // bcrypt hash only — never the raw password
    },
    role: {
      type: String,
      enum: ["student", "employee", "organization", "instructor", "researcher"],
      default: "student",
    },

    // --- Fields required by shared_data_schema.md's Common User Profile object ---
    // user_id is Mongo's own _id, exposed as "user_id" in API responses (see auth.routes.js toPublicProfile()).
    readiness_score: { type: Number, default: 0, min: 0, max: 100 },
    total_xp: { type: Number, default: 0, min: 0 },
    global_rank: { type: Number, default: null }, // computed by Vishnu Priya's leaderboard logic, not set here
    unlocked_badges: [{ type: String }],           // exact display-name strings, e.g. "Quantum Novice" — see badges/badges_list.md
    recommended_next_module: { type: String, default: "Module 1: Cybersecurity Basics" },

    // --- Supporting fields, used internally but not part of the shared schema's public shape ---
    completed_modules: [{ type: String }], // module_id values, e.g. ["module_1_basics"]
    is_email_verified: { type: Boolean, default: false },
    last_login_at: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
