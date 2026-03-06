/**
 * Sadece ADMIN rolündeki kullanıcıların geçmesine izin verir.
 * Önce authenticate middleware kullanılmalı.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Token gerekli.' });
  }
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
  }
  next();
}

module.exports = { requireAdmin };
