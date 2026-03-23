/**
 * utils/mailer.js
 *
 * Nodemailer tabanlı e-posta gönderim servisi.
 * Şifre sıfırlama gibi transactional e-postalar için kullanılır.
 *
 * Gerekli .env ayarları:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FRONTEND_URL
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Şifre sıfırlama e-postası gönderir.
 * @param {string} to - Alıcı e-posta adresi
 * @param {string} resetUrl - Şifre sıfırlama bağlantısı (token dahil)
 */
async function sendResetEmail(to, resetUrl) {
  const mailOptions = {
    from: `"Doğan Emlak" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Şifre Sıfırlama Talebi',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6b1d2a; margin-bottom: 16px;">Şifre Sıfırlama</h2>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">
          Hesabınız için şifre sıfırlama talebinde bulunuldu. Aşağıdaki bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 32px; background-color: #6b1d2a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
            Şifremi Sıfırla
          </a>
        </div>
        <p style="color: #666; font-size: 13px; line-height: 1.5;">
          Bu bağlantı <strong>1 saat</strong> süreyle geçerlidir. Eğer bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">Doğan Emlak Group</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };
