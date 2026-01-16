const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true
    },
    categories: [{
      type: String,
      enum: ['men', 'women', 'kids', 'accessories', 'footwear']
    }],
    brand: {
      type: String,
      enum: ['nike', 'adidas', 'puma', 'levi', 'zara', 'h&m', null],
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", FeatureSchema);