/**
 * Veritabanındaki bir kullanıcıyı ADMIN yapar veya yeni admin oluşturur.
 * Kullanım:
 *   node scripts/createAdminUser.js                    → "admin" / "admin@doganemlak.local" kullanıcısı oluşturur veya ADMIN yapar
 *   node scripts/createAdminUser.js meryem            → "meryem" kullanıcı adlı hesabı ADMIN yapar
 *   node scripts/createAdminUser.js user@email.com    → Bu e-postaya sahip hesabı ADMIN yapar
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_EMAIL = 'admin@doganemlak.local';
const DEFAULT_ADMIN_PASSWORD = 'Admin123!';

async function run() {
  const arg = process.argv[2]; // username veya email
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doganemlak');
    console.log('MongoDB bağlandı.');

    let user;
    if (arg) {
      const isEmail = arg.includes('@');
      user = await User.findOne(isEmail ? { email: arg } : { username: arg });
      if (!user) {
        console.error('Kullanıcı bulunamadı:', arg);
        process.exit(1);
      }
    } else {
      user = await User.findOne({
        $or: [{ username: DEFAULT_ADMIN_USERNAME }, { email: DEFAULT_ADMIN_EMAIL }],
      });
      if (!user) {
        const password_hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
        user = await User.create({
          username: DEFAULT_ADMIN_USERNAME,
          email: DEFAULT_ADMIN_EMAIL,
          password_hash,
          role: 'ADMIN',
        });
        console.log('Admin kullanıcı oluşturuldu.');
        console.log('  Kullanıcı adı:', DEFAULT_ADMIN_USERNAME);
        console.log('  E-posta:', DEFAULT_ADMIN_EMAIL);
        console.log('  Şifre:', DEFAULT_ADMIN_PASSWORD);
        console.log('  (İlk girişten sonra şifreyi değiştirmeyi unutmayın.)');
      }
    }

    if (user.role !== 'ADMIN') {
      await User.updateOne({ _id: user._id }, { role: 'ADMIN' });
      console.log('Kullanıcı ADMIN yapıldı:', user.username, user.email);
    } else {
      console.log('Zaten ADMIN:', user.username, user.email);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Bağlantı kapatıldı.');
  }
}

run();
