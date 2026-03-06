/**
 * JWT secret tek yerden; hem imzalama hem doğrulama aynı değeri kullanır.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

if (!process.env.JWT_SECRET) {
  console.warn('Uyarı: JWT_SECRET .env dosyasında tanımlı değil, varsayılan kullanılıyor.');
}

module.exports = { JWT_SECRET, JWT_EXPIRES };
