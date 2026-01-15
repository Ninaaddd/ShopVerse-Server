// middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("+role");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid user" });
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      userName: user.userName,
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ✅ Add explicit admin middleware
const requireAdmin = async (req, res, next) => {
  try {
    // User must be authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user!",
      });
    }

    // ✅ Verify admin role from JWT token (not from request body!)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
};
module.exports = { authenticate, requireAdmin };
