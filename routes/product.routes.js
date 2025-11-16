const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const productController = require("../controllers/productController");
const encryptResponse = require("../middlewares/encryptResponse");

// ✅ Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../brandings")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

router.post("/fiadmin", encryptResponse, productController.createProduct);


router.get("/", productController.getAllProducts);

module.exports = router;
