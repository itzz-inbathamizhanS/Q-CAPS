// Content-Security/Backend/server.js
// Main entry point for Q-CAPS backend service

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import authentication routes (resilient to flat or nested directory structures)
const authRoutes = (() => {
  try {
    return require("./auth.routes");
  } catch (err) {
    return require("./routes/auth.routes");
  }
})();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. CORS Configuration
// ==========================================
// Configured specifically for Vite frontend (http://localhost:5173 / http://127.0.0.1:5173)
// and supports additional production origins via CLIENT_URL / FRONTEND_URL in .env
const rawClientUrls = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : []),
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : []),
];

const allowedOrigins = [
  ...new Set(
    rawClientUrls
      .map((url) => url && url.trim().replace(/\/$/, ""))
      .filter(Boolean)
  ),
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. Postman, curl, server-to-server, mobile apps)
    if (!origin) {
      return callback(null, true);
    }
    const cleanOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 2. Health & Base Routes
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    app: "Q-CAPS Backend API",
    status: "online",
    endpoints: {
      auth: "/api/auth",
      health: "/health",
    },
  });
});

app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    status: "ok",
    app: "Q-CAPS",
    database: dbStates[dbStatus] || "unknown",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 3. API Routes
// ==========================================
app.use("/api/auth", authRoutes);

// ==========================================
// 4. Error Handling Middleware
// ==========================================
// Handle CORS and unexpected errors gracefully with clean JSON responses
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith("CORS policy")) {
    console.warn(`[CORS Blocked] ${err.message}`);
    return res.status(403).json({ error: err.message });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    error: "Internal server error. Please try again later.",
  });
});

// ==========================================
// 5. Database Connection & Server Initialization
// ==========================================
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("❌ [MongoDB] MONGO_URI is not set in your .env file!");
  console.error("👉 Please add MONGO_URI to Content-Security/Backend/.env");
} else if (mongoUri.includes("<user>") || mongoUri.includes("<password>")) {
  console.warn("⚠️  [MongoDB] MONGO_URI contains placeholder credentials (<user>:<password>).");
  console.warn("👉 Please update Content-Security/Backend/.env with your real MongoDB Atlas connection string before running with database features.");
} else {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log("✅ [MongoDB] Connected successfully to database");
    })
    .catch((err) => {
      console.error("❌ [MongoDB] Connection error:", err.message);
      console.error("👉 Check that your IP address is whitelisted in MongoDB Atlas Network Access and credentials are valid.");
    });
}

const server = app.listen(PORT, () => {
  console.log("\n=======================================================");
  console.log(`🚀 Q-CAPS Backend Server running on port ${PORT}`);
  console.log(`📡 URL:             http://localhost:${PORT}`);
  console.log(`🩺 Health Check:    http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API:        http://localhost:${PORT}/api/auth`);
  console.log(`🛡️  CORS Allowed:    ${allowedOrigins.join(", ")}`);
  console.log("=======================================================\n");
});

module.exports = { app, server };
