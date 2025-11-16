const User = require('../models/User');
const { decryptAndVerifyToken } = require('../services/token.service');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const tokenStr = authHeader.split(' ')[1];

    if (!tokenStr) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = await decryptAndVerifyToken(tokenStr);

    // ✅ REQUIRED LINE
    req.userId = decoded.id;

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });

    next();
  } catch (error) {
    console.error('Protect middleware error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = protect;
