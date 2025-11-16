const { encrypt } = require('../services/encryption.service');

module.exports = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    try {
      // ✅ Convert object/array to string
      const stringData = JSON.stringify(data);

      const encrypted = encrypt(stringData);

      return originalJson.call(this, { data: encrypted });

    } catch (err) {
      console.error("❌ Response encryption failed:", err.message);
      return originalJson.call(this, { message: "Encryption error" });
    }
  };

  next();
};
