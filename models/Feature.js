const mongoose = require("mongoose");

const FeatureSchema = new mongoose.Schema(
  {
    image: String,
    linkType: {
      type: String,
      enum: ['category', 'brand', 'none'],
      default: 'none'
    },
    linkValue: String, // The category or brand value
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", FeatureSchema);