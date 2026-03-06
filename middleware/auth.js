const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/jwt');

/**
 * JWT token doğrular; req.user olarak kullanıcıyı ekler.
 * Koruma gereken route'larda kullanın.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token gerekli.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password_hash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token süresi doldu.' });
    }
    return res.status(401).json({ success: false, message: 'Geçersiz token.' });
  }
}

module.exports = { authenticate };
