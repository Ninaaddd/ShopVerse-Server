const express = require("express");

const {
  addProductReview,
  getProductReviews,
} = require("../../controllers/shop/product-review-controller");
const { authenticate } = require("../../middlewares/auth");
const router = express.Router();

router.post("/add", authenticate, addProductReview);
router.get("/:productId", getProductReviews);

module.exports = router;
