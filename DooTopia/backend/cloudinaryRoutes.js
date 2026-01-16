const express = require('express');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: './config.env' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dppzfeczt',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

let cloudinaryRoutes = express.Router();

cloudinaryRoutes.route("/cloudinary/delete").delete(async (request, response) => {
  try {
    const { publicId } = request.body;
    
    if (!publicId) {
      return response.status(400).json({ error: "Missing publicId" });
    }

    console.log('Attempting to delete image with publicId:', publicId);

    const result = await cloudinary.uploader.destroy(publicId);
    
    console.log('Cloudinary deletion result:', result);

    if (result.result === 'ok') {
      response.status(200).json({ message: "Image deleted successfully", result });
    } else if (result.result === 'not found') {
      // Image not found, but that's okay - maybe it was already deleted
      response.status(200).json({ message: "Image not found (may be already deleted)", result });
    } else {
      response.status(500).json({ error: "Failed to delete image", result });
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    response.status(500).json({ error: "Failed to delete image", details: error.message });
  }
});

module.exports = cloudinaryRoutes;
