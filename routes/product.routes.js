const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const encryptResponse = require("../middlewares/encryptResponse");

router.post(
  "/fiadmin",
  productController.uploadMiddleware,   // MUST BE FIRST
  productController.createProduct
);

router.get("/", productController.getAllProducts);

module.exports = router;
