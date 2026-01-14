const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
} = require("../../controllers/shop/order-controller");
const { authenticate } = require("../../middlewares/auth");

const router = express.Router();

router.post("/create", authenticate,createOrder);
router.post("/capture", authenticate,capturePayment);
router.get("/list/", authenticate, getAllOrdersByUser);
router.get("/details/:id", authenticate, getOrderDetails);

module.exports = router;
