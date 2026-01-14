const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
} = require("../../controllers/shop/cart-controller");
const { authenticate } = require("../../middlewares/auth");

const router = express.Router();

router.post("/add", authenticate ,addToCart);
router.get("/get/:userId", authenticate ,fetchCartItems);
router.put("/update-cart", authenticate ,updateCartItemQty);
router.delete("/:userId/:productId", authenticate ,deleteCartItem);

module.exports = router;
