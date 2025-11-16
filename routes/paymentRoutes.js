const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');



router.get('/qr', paymentController.generatePaymentQR); // GET /api/payment/qr?productId=...&note=...
//router.post('/update-payment-status',paymentController.updatePaymentStatus);

module.exports = router;
