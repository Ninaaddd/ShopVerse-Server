require('dotenv').config();
const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);

router.get("/check-auth", (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.json({
      success: false,
      message: "No active session",
      user: null,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "CLIENT_SECRET_KEY");
    res.status(200).json({
      success: true,
      message: "Authenticated user!",
      user: decoded,
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Invalid or expired token",
      user: null,
    });
  }
});


module.exports = router;
