const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES } = require('../config/jwt');
const { sendResetEmail } = require('../utils/mailer');

function toSafeUser(user) {
  const u = user.toObject ? user.toObject() : user;
  const { password_hash, reset_token, reset_token_expires, ...rest } = u;
  return rest;
}

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 */
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı, e-posta ve şifre gerekli.',
      });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }],
    });
    if (existing) {
      const field = existing.email === email.toLowerCase().trim() ? 'E-posta' : 'Kullanıcı adı';
      return res.status(409).json({
        success: false,
        message: `${field} zaten kullanılıyor.`,
      });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
    });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    await User.updateOne({ _id: user._id }, { last_login: new Date() });

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı.',
      token,
      user: toSafeUser(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Kayıt sırasında bir hata oluştu.' });
  }
}

/**
 * POST /api/auth/login
 * Body: { login (email veya username), password }
 */
async function login(req, res) {
  try {
    const { login: loginInput, password } = req.body;

    if (!loginInput?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-posta/kullanıcı adı ve şifre gerekli.',
      });
    }

    const isEmail = loginInput.includes('@');
    const user = await User.findOne(
      isEmail ? { email: loginInput.toLowerCase().trim() } : { username: loginInput.trim() }
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'E-posta/kullanıcı adı veya şifre hatalı.',
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'E-posta/kullanıcı adı veya şifre hatalı.',
      });
    }

    await User.updateOne({ _id: user._id }, { last_login: new Date() });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.json({
      success: true,
      message: 'Giriş başarılı.',
      token,
      user: toSafeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Giriş sırasında bir hata oluştu.' });
  }
}

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Mevcut kullanıcı bilgisini döner (authenticate middleware gerekli).
 */
async function getMe(req, res) {
  try {
    res.json({ success: true, user: toSafeUser(req.user) });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ success: false, message: 'Kullanıcı bilgisi alınamadı.' });
  }
}

/**
 * DELETE /api/auth/me
 * Header: Authorization: Bearer <token>
 * Giriş yapan kullanıcının hesabını kalıcı olarak siler.
 */
async function deleteMe(req, res) {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Hesabınız kalıcı olarak silindi.' });
  } catch (err) {
    console.error('DeleteMe error:', err);
    res.status(500).json({ success: false, message: 'Hesap silinirken hata oluştu.' });
  }
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Güvenlik: E-posta kayıtlı olmasa bile aynı başarı mesajını döndürür (user enumeration önlemi).
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: 'E-posta adresi gerekli.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Kullanıcı bulunamazsa bile aynı mesajı döndür (güvenlik)
    if (!user) {
      return res.json({
        success: true,
        message: 'E-posta adresinize şifre sıfırlama bağlantısı gönderildi.',
      });
    }

    // Token üret — ham haliyle e-posta, SHA-256 hash ile DB
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.reset_token = hashedToken;
    user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 saat
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL;
    const resetUrl = `${frontendUrl}/sifre-sifirla?token=${rawToken}`;

    await sendResetEmail(user.email, resetUrl);

    res.json({
      success: true,
      message: 'E-posta adresinize şifre sıfırlama bağlantısı gönderildi.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Şifre sıfırlama e-postası gönderilemedi.' });
  }
}

/**
 * POST /api/auth/reset-password
 * Body: { token, password }
 *
 * URL'den gelen ham token'ı SHA-256 ile hash'leyerek DB'deki kayıtla karşılaştırır.
 */
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token ve yeni şifre gerekli.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Şifre en az 6 karakter olmalıdır.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      reset_token: hashedToken,
      reset_token_expires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı.',
      });
    }

    user.password_hash = await bcrypt.hash(password, 12);
    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.json({ success: true, message: 'Şifreniz başarıyla güncellendi.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Şifre sıfırlanırken hata oluştu.' });
  }
}

module.exports = { register, login, getMe, deleteMe, forgotPassword, resetPassword };
