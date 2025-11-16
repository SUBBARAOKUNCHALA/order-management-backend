const QRCode = require('qrcode');
const Product = require('../models/Product');
const { decrypt } = require('../services/encryption.service');
const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

// CSV writer config
const csvPath = path.join(__dirname, '../logs/payments.csv');

const csvWriter = createObjectCsvWriter({
  path: csvPath,
  header: [
    { id: 'timestamp', title: 'Timestamp' },
    { id: 'productId', title: 'Product ID' },
    { id: 'productName', title: 'Product Name' },
    { id: 'amount', title: 'Amount (INR)' },
    { id: 'upiUrl', title: 'UPI URL' },
    { id: 'status', title: 'Status' },
  ],
  append: true
});

exports.generatePaymentQR = async (req, res) => {
  try {
    const { productId, note, amount } = req.query;

    let payAmount;
    let productName = "Order Payment";

    if (amount) {
      payAmount = amount;
    }

    else if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "❌ Product not found" });
      }

      productName = decrypt(JSON.parse(product.name));
      payAmount = product.price;
    }

    else {
      return res.status(400).json({ message: "❌ Either amount or productId is required" });
    }

    const upiId = process.env.UPI_ID;
    const upiName = encodeURIComponent(process.env.USER_NAME);
    const transactionNote = encodeURIComponent(note || productName);

    const upiUrl = `upi://pay?pa=${upiId}&pn=${upiName}&am=${payAmount}&cu=INR&tn=${transactionNote}`;
    const qrImage = await QRCode.toDataURL(upiUrl);

    await csvWriter.writeRecords([
      {
        timestamp: new Date().toISOString(),
        productId: productId || "CART_PAYMENT",
        productName,
        amount: payAmount,
        upiUrl,
        status: 'QR Generated'
      }
    ]);

    return res.json({
      qrImage,
      upiUrl,
      amount: payAmount,
      product: productName
    });

  } catch (err) {
    console.error("QR generation failed:", err);

    await csvWriter.writeRecords([
      {
        timestamp: new Date().toISOString(),
        productId: req.query.productId || 'N/A',
        productName: 'N/A',
        amount: req.query.amount || 'N/A',
        upiUrl: 'N/A',
        status: `Error: ${err.message}`
      }
    ]);

    return res.status(500).json({ message: "❌ QR generation failed", error: err.message });
  }
};