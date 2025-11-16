const express = require('express');
const router = express.Router();
const { registerUser, loginUser,logoutUser } = require('../controllers/authController');
const decryptBody = require('../middlewares/decryptBody');
const encryptResponse = require('../middlewares/encryptResponse');
// const decryptBody = require('../middlewares/decryptBody');


router.post('/register', registerUser);
router.post('/login',encryptResponse, loginUser);
// routes/authRoutes.js
router.post('/logout', logoutUser);


module.exports = router;
