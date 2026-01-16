//server/controllers/common/feature-controller.js
const Feature = require("../../models/Feature");

const addFeatureImage = async (req, res) => {
  try {
    const { image, categories, brand } = req.body;

    // Validate that at least one of categories or brand is provided
    if ((!categories || categories.length === 0) && !brand) {
      return res.status(400).json({
        success: false,
        message: "At least one category or a brand must be selected",
      });
    }

    const featureImages = new Feature({
      image,
      categories: categories || [],
      brand: brand || null,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, categories, brand } = req.body;

    // Validate that at least one of categories or brand is provided
    if ((!categories || categories.length === 0) && !brand) {
      return res.status(400).json({
        success: false,
        message: "At least one category or a brand must be selected",
      });
    }

    const updatedImage = await Feature.findByIdAndUpdate(
      id,
      {
        image,
        categories: categories || [],
        brand: brand || null,
      },
      { new: true }
    );

    if (!updatedImage) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedImage,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedImage = await Feature.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feature image deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { 
  addFeatureImage, 
  updateFeatureImage,
  getFeatureImages, 
  deleteFeatureImage 
};