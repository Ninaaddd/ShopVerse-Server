require('dotenv').config();
const express = require("express");

const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../../controllers/auth/auth-controller");
const { loginRateLimiter } = require("../../controllers/rateLimit")
const { authenticate } = require("../../middlewares/auth");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginRateLimiter, loginUser);
router.post("/logout", authenticate, logoutUser);

router.get("/check-auth", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated user",
    // user: {
    //   // id: req.user.id,
    //   email: req.user.email,
    //   userName: req.user.userName,
    //   // deliberately NO role
    // },
  });
});


module.exports = router;
