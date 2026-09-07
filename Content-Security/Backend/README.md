# Q-CAPS Auth Backend — Setup Guide (Schema-Aligned Version)

## Why this version is different from before
Every field returned to the frontend now matches `shared_data_schema.md`'s **Common User Profile** object exactly — `user_id`, `readiness_score`, `total_xp`, `global_rank`, `unlocked_badges`, `recommended_next_module`. There is a single function, `toPublicProfile()` in `auth.routes.js`, that builds this shape — every route calls it instead of hand-writing JSON, so the four of you can never accidentally drift out of sync on field names again.

## 1. Install dependencies
```bash
npm install express mongoose bcrypt jsonwebtoken express-rate-limit dotenv cors
```

## 2. Environment variables
Create `.env` in the backend root (add it to `.gitignore` — never commit this file):
```env
JWT_SECRET=replace_this_with_a_long_random_string_at_least_32_chars
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/qcaps
PORT=5000
```
Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 3. File placement
```
backend/
├── models/User.model.js
├── middleware/authMiddleware.js
├── routes/auth.routes.js
├── server.js        (minimal example below)
└── .env
```

## 4. Minimal server.js
```js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(process.env.PORT || 5000, () =>
  console.log(`Q-CAPS backend running on port ${process.env.PORT || 5000}`)
);
```

## 5. What Niranjan's frontend gets back (exact shape, every time)
```json
{
  "user_id": "665f1c2e8a1b2c3d4e5f6789",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "readiness_score": 0,
  "total_xp": 0,
  "global_rank": null,
  "unlocked_badges": [],
  "recommended_next_module": "A1: Computing Foundations"
}
```
New users start at 0/null/empty — `readiness_score`, `total_xp`, `global_rank` are all owned and updated by **Vishnu Priya's** scoring/leaderboard logic (Segment 3 of the master plan), not by this auth system. This file only creates the account and issues the login token.

**Curriculum scope note:** the full curriculum is now 38 modules across the Core track + Tracks A–D (see `MASTER_CURRICULUM_INDEX.md`), not just the original 3. `recommended_next_module` and `completed_modules` both use `module_id` values from that index — the field names and behavior here haven't changed, only the size of the curriculum they now point into. Badge strings pushed into `unlocked_badges` should come from `badges/master_badges_and_certificates.md`, which supersedes the original `badges/badges_list.md` (that file still applies to the 3 core modules specifically; the master file covers all 38).

## 6. Handoff to Vishnu Priya
Her backend (or a shared one, if you consolidate into a single server) needs write access to update: `readiness_score`, `total_xp`, `global_rank`, `unlocked_badges`, `recommended_next_module`, `completed_modules` on the same `User` model — after quiz submissions and scan results come in, now across all 38 modules rather than 3. This model is built to support that without changes.

## 7. Security checklist (implemented)
- [x] bcrypt password hashing (salt rounds = 12), never logged or stored in plaintext.
- [x] Stateless JWT sessions, 2-hour expiry.
- [x] Rate limiting on `/register` and `/login` (10 attempts / 15 min / IP).
- [x] Generic login errors (prevents user-enumeration).
- [x] Server-side email/password validation (never trust client-only checks).
- [x] Role-based middleware (`verify_role`) ready for org/instructor-only routes.

## 8. Still open
- Password reset flow — not yet built.
- Refresh tokens for longer sessions — not yet built.
- **Confirm final stack with the team.** `master_implementation_plan.md` allows either FastAPI or Node/Express for the backend — this is built in Node/Express since it matches the AI-prompt example in the original brief. If Vishnu Priya is building the real backend in FastAPI instead, tell me and I'll port this exactly (same field names, same bcrypt/JWT behavior) to Python so there's one consistent stack, not two.
