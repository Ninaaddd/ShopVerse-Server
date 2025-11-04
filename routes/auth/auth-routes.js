require('dotenv').config();
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
} = require("../../controllers/auth/auth-controller");
const { loginRateLimiter } = require("../../controllers/rateLimit")

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginRateLimiter, loginUser);
router.post("/logout", authMiddleware, logoutUser);

router.get("/check-auth", async(req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.json({
      success: false,
      message: "No active session",
      user: null,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    console.error("JWT Verfication failed: ",err.message);
    const userFromDb = await User.findById(decoded.id).select("+role");

    if (!userFromDb) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        user: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Authenticated user!",
      user: {
        id: userFromDb._id.toString(),
        role: userFromDb.role,
        email: userFromDb.email,
        userName: userFromDb.userName,
      },
    });
  } catch (error) {
    console.error("error authentication",error.message);
    res.json({
      success: false,
      message: "Invalid or expired token",
      user: null,
    });
  }
});


module.exports = router;
