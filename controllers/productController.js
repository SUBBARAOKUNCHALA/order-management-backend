const Product = require("../models/Product");
const { decrypt } = require("../services/encryption.service");
const path = require("path");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");
const upload = require("../middlewares/upload");

// Used in route
exports.uploadMiddleware = upload.single("image");

// -------------------- CREATE PRODUCT -------------------------
exports.createProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Cloudinary image URL
    const imageUrl = req.file.path;

    const { name, description, price, category, discount, sizes } = req.body;

    const decryptedName = await decrypt(JSON.parse(name));
    const decryptedDescription = await decrypt(JSON.parse(description));
    const decryptedPrice = parseFloat(await decrypt(JSON.parse(price)));
    const decryptedCategory = await decrypt(JSON.parse(category));
    const decryptedDiscount = discount ? parseFloat(await decrypt(JSON.parse(discount))) : 0;
    const decryptedSizes = JSON.parse(await decrypt(JSON.parse(sizes)));

    const product = new Product({
      name: decryptedName,
      description: decryptedDescription,
      price: decryptedPrice,
      category: decryptedCategory,
      discount: decryptedDiscount,
      sizes: decryptedSizes,
      imagePath: imageUrl, // <-- Cloudinary URL
    });
    console.info("New Product Data:", product);

    await product.save();

    res.json({
      message: "Product uploaded successfully",
      product,
    });

  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//  Fetch All Products
exports.getAllProducts = async (req, res) => {
  try {
    const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";

    const products = await Product.find();

    const list = products.map(p => ({
      _id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      discount: p.discount,
      sizes: p.sizes,
      imageUrl: p.imagePath ? `${BASE_URL}${p.imagePath}` : null, // ✅ Use env variable
      imagePath: p.imagePath, // keep original path if needed
      createdAt: p.createdAt,
    }));

    return res.json(list);

  } catch (error) {
    console.error("❌ Failed to fetch products:", error);
    return res.status(500).json({ message: "Server error" });
  }
};