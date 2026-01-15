// server/routes/shop/cart-routes.js
const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");
const { authenticate } = require("../../middlewares/auth");

const router = express.Router();

// ✅ All routes now use authenticated user, no userId in URL
router.post("/add", authenticate, addToCart);
router.get("/get", authenticate, fetchCartItems);  // removed /:userId
router.put("/update-cart", authenticate, updateCartItemQty);
router.delete("/:productId", authenticate, deleteCartItem);  // removed userId param

module.exports = router;