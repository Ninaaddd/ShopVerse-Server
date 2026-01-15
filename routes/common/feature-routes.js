const express = require("express");

const {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} = require("../../controllers/common/feature-controller");
const { authenticate, requireAdmin } = require("../../middlewares/auth");
const router = express.Router();

router.post("/add", authenticate, requireAdmin, addFeatureImage);
router.get("/get", getFeatureImages);
router.delete("/delete/:id", authenticate, requireAdmin, deleteFeatureImage);

module.exports = router;