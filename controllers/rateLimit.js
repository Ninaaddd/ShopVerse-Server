const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = rateLimit;


// Login-specific limiter
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    const email = req.body?.email || "unknown";
    return `${ip}:${email}`;
  },
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


module.exports = { loginRateLimiter };
