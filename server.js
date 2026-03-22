require('dotenv').config();
const fs      = require('fs');
const express = require('express');
const cors    = require('cors');

const connectDB                 = require('./config/db');
const authRoutes                = require('./routes/authRoutes');
const listingRoutes             = require('./routes/listingRoutes');
const favoriteRoutes            = require('./routes/favoriteRoutes');
const favoriteConsultantRoutes  = require('./routes/favoriteConsultantRoutes');
const adminRoutes               = require('./routes/adminRoutes');
const analyticsRoutes           = require('./routes/analyticsRoutes');
const categoryRoutes            = require('./routes/categoryRoutes');
const featureDefinitionRoutes   = require('./routes/featureDefinitionRoutes');
const uploadRoutes              = require('./routes/uploadRoutes');
const cityRoutes                = require('./routes/cityRoutes');
const consultantRoutes          = require('./routes/consultantRoutes');
const viewCountBuffer           = require('./utils/viewCountBuffer');

// DB bağlantısı kurulduktan sonra view_count buffer'ını başlat
(async () => {
  await connectDB();
  viewCountBuffer.start();
})();


fs.mkdirSync('uploads', { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.get('/api/health', (_req, res) =>
  res.json({ ok: true, message: 'Doğan Emlak API çalışıyor.' })
);

app.use('/api/auth',                authRoutes);
app.use('/api/listings',            listingRoutes);
app.use('/api/consultants',         consultantRoutes);
app.use('/api/favorites',           favoriteRoutes);
app.use('/api/favorite-consultants', favoriteConsultantRoutes);
app.use('/api/admin/upload',        uploadRoutes);
app.use('/api/admin/analytics',     analyticsRoutes);
app.use('/api/admin',               adminRoutes);
app.use('/api/categories',          categoryRoutes);
app.use('/api/feature-definitions', featureDefinitionRoutes);
app.use('/api/cities',              cityRoutes);

const complaintRoutes = require('./routes/complaintRoutes');
app.use('/api/complaints',          complaintRoutes);

const server = app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} üzerinde çalışıyor.`);
});

// ── Graceful shutdown — view_count buffer'ını temizle ────────────────────────
async function gracefulShutdown(signal) {
  console.log(`[${signal}] Kapanış öncesi view_count buffer temizleniyor...`);
  try {
    viewCountBuffer.stop();
    await viewCountBuffer.flush();
    console.log('[shutdown] Buffer temizlendi.');
  } catch (err) {
    console.error('[shutdown] Buffer flush hatası:', err.message);
  }
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
