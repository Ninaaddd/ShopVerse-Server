const express = require("express");

const {
  addAddress,
  fetchAllAddress,
  editAddress,
  deleteAddress,
} = require("../../controllers/shop/address-controller");
const { authenticate } = require("../../middlewares/auth");

const router = express.Router();

router.post("/add", authenticate,addAddress);
router.get("/get", authenticate,fetchAllAddress);
router.delete("/delete/:addressId", authenticate,deleteAddress);
router.put("/update/:addressId", authenticate,editAddress);

module.exports = router;
