const express = require("express");

const { authenticate } = require("../../middlewares/auth");
const { authorize } = require("../../middlewares/authorize");

const router = express.Router();

router.get(
  "/access-check",
  authenticate,
  authorize("admin"),
  (req, res) => {
    res.status(200).json({ success: true });
  }
);

module.exports = router;
