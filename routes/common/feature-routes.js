const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
} = require("../../controllers/common/feature-controller");
const { authenticate } = require("../../middlewares/auth");
const router = express.Router();

router.post("/add", authenticate, addFeatureImage);
router.get("/get", getFeatureImages);

module.exports = router;
