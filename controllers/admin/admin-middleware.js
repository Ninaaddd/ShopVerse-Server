// middleware/adminMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, message: "Unauthorised user!" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userFromDb = await User.findById(decoded.id);
    if (!userFromDb) return res.status(401).json({ success: false, message: "User not found" });

    // Optionally check tokenVersion
    if (decoded.tokenVersion !== userFromDb.tokenVersion) {
      return res.status(401).json({ success: false, message: "Session invalidated" });
    }

    if (userFromDb.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: admin only" });
    }

    req.user = {
      id: userFromDb._id.toString(),
      role: userFromDb.role,
      userName: userFromDb.userName,
      email: userFromDb.email
    };
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Unauthorised user!" });
  }
};

module.exports = adminMiddleware;
