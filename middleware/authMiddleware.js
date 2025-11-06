// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "YOUR_SECRET_KEY"; // ✅ same key as in login

    const decoded = jwt.verify(token, secret);

    // ✅ Attach decoded user data
    req.user = {
      id: decoded.id || decoded._id, // ensure compatibility
      role: decoded.role,
      email: decoded.email,
    };

    if (!req.user.id) {
      return res.status(401).json({ error: "Invalid token payload: no user ID found" });
    }

    next();
  } catch (err) {
    console.error("❌ JWT Auth Error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ✅ Only for admin routes
export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
};
