const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES } = require('../config/jwt');

function toSafeUser(user) {
  const u = user.toObject ? user.toObject() : user;
  const { password_hash, ...rest } = u;
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

module.exports = { register, login, getMe };
