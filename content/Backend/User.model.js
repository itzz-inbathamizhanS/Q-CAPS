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
    unlocked_badges: [{ type: String }],           // exact display-name strings, e.g. "Quantum Novice" — see badges/master_badges_and_certificates.md
    // Default points new users to Track A's entry module (A1 — the sole entry point
    // now that the standalone module_1/2/3 set has been removed/folded into Track A).
    // Once the diagnostic/placement system (not yet built — see MASTER_CURRICULUM_INDEX.md)
    // exists, it should override this default and place advanced learners directly into
    // Track B/C as appropriate, rather than always starting everyone at A1.
    recommended_next_module: { type: String, default: "A1: Computing Foundations" },

    // --- Supporting fields, used internally but not part of the shared schema's public shape ---
    completed_modules: [{ type: String }], // module_id values from MASTER_CURRICULUM_INDEX.md, e.g. ["module_1_basics", "track_a_a1_computing_foundations"]
    is_email_verified: { type: Boolean, default: false },
    last_login_at: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
