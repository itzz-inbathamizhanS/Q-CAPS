// backend/middleware/authMiddleware.js
// Verifies the JWT sent by the client and attaches the decoded user to req.user.
// Use on any protected route: router.get("/me", verify_token, handler)

const jwt = require("jsonwebtoken");

function verify_token(req, res, next) {
  const authHeader = req.headers.authorization; // expected: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided. Access denied." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, email, role }
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    return res.status(403).json({ error: "Invalid token." });
  }
}

// Optional role-gate, e.g. verify_role("organization") for org-only routes.
function verify_role(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to access this resource." });
    }
    next();
  };
}

module.exports = { verify_token, verify_role };
