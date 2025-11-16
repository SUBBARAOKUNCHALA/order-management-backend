// services/token.service.js
const jwt = require('jsonwebtoken');
const { encrypt, decrypt } = require('./encryption.service');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'; // adjust

/**
 * Create a signed JWT and then encrypt the signed token using AES-GCM.
 * Returns an object: { iv, content, tag } (hex strings) — treat this as the token.
 */
async function createEncryptedToken(payload) {
  // Create signed JWT (HS256). You can switch to RS256 if you prefer asymmetric keys.
  const signed = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Encrypt the signed token (string)
  const encrypted = encrypt(signed); // using your AES-GCM service => {iv, content, tag}
  return encrypted;
}

/**
 * Decrypt the AES-GCM encrypted token (object or compact string) and then verify the signed JWT.
 * tokenObj can be either:
 *  - { iv, content, tag }  (hex strings)
 *  - "iv.content.tag" string (compact form)
 *
 * Returns: { decodedJwt } on success or throws error
 */
async function decryptAndVerifyToken(tokenObj) {
  let tokenPayload;

  // If compact string format "iv.content.tag"
  if (typeof tokenObj === 'string') {
    const parts = tokenObj.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    tokenPayload = { iv: parts[0], content: parts[1], tag: parts[2] };
  } else {
    tokenPayload = tokenObj;
  }

  // Decrypt => gets the signed JWT string
  const signedJwt = decrypt(tokenPayload); // may throw if tampered
  // Verify signature and expiration
  const decoded = jwt.verify(signedJwt, JWT_SECRET);
  return decoded;
}

module.exports = { createEncryptedToken, decryptAndVerifyToken };
