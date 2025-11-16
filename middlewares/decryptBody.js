const { decrypt } = require('../services/encryption.service');

module.exports = (req, res, next) => {
  try {
    let token;

    if (req.body && req.body.data) {
      token = req.body.data;
    } else if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    } else {
      return res.status(401).json({ message: "No token provided" });
    }

    console.log("Token for decryption:", token);

    // If token is an object (iv/content), pass as is
    if (typeof token === 'object' && token.iv && token.content) {
      req.body = decrypt(token);
    } else {
      req.body = decrypt(token.toString());
    }

    next();
  } catch (err) {
    console.error("❌ JWT decryption failed:", err.message, err);
    return res.status(401).json({ message: "Invalid token" });
  }
};
