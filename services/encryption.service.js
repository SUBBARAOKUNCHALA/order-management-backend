require('dotenv').config();
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const SECRET_KEY = Buffer.from(process.env.ENCRYPTION_SECRET, 'hex');

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, SECRET_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return { iv: iv.toString('hex'), content: encrypted, tag };
}

function decrypt({ iv, content, tag }) {
  const decipher = crypto.createDecipheriv(ALGO, SECRET_KEY, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  let decrypted = decipher.update(content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


module.exports = { encrypt, decrypt };
