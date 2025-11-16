// controllers/authController.js
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { decrypt } = require('../services/encryption.service'); // decrypt incoming fields
const { createEncryptedToken } = require('../services/token.service');

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing required fields" });

    // Decrypt incoming fields from frontend
    const decryptedName = await decrypt(name);
    const decryptedEmail = await decrypt(email);
    const decryptedPassword = await decrypt(password);

    // Hash email to check uniqueness
    const emailHash = crypto.createHash("sha256").update(decryptedEmail).digest("hex");

    const existingUser = await User.findOne({ emailHash });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(decryptedPassword, 10);

    // Save user
    const user = new User({
      name: decryptedName,
      email: decryptedEmail,
      emailHash,
      password: hashedPassword,
      userType: "customer"
    });

    await user.save();

    // Create encrypted token
    const tokenObj = await createEncryptedToken({ id: user._id });
    const compactToken = `${tokenObj.iv}.${tokenObj.content}.${tokenObj.tag}`;

    res.json({
      user: { id: user._id, name: decryptedName, email: decryptedEmail },
      token: compactToken,
      message: "Registration successful"
    });

  } catch (err) {
    console.error(" Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const decryptedEmail = await decrypt(req.body.email);
    const decryptedPassword = await decrypt(req.body.password);

    const user = await User.findOne({ email: decryptedEmail });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(decryptedPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const tokenObj = await createEncryptedToken({ id: user._id });
    const compactToken = `${tokenObj.iv}.${tokenObj.content}.${tokenObj.tag}`;

    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token: compactToken,
      message: 'Login successful'
    });
  } catch (err) {
    console.error(' Login Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// controllers/authController.js

exports.logoutUser = async (req, res) => {
  try {
    // Nothing to delete because JWT is stateless

    res.json({
      message: "Logout successful. Please clear the token on the frontend."
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
