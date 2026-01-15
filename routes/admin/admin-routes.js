const express = require("express");

const { authenticate, requireAdmin } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");

const router = express.Router();

router.get(
  "/access-check",
  authenticate,
  requireAdmin,
  authorize("admin"),
  (req, res) => {
    res.status(200).json({ success: true });
  }
);

module.exports = router;
