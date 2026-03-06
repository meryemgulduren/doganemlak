require('dotenv').config();
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const listingRoutes = require('./routes/listingRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const featureDefinitionRoutes = require('./routes/featureDefinitionRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

connectDB();

fs.mkdirSync('uploads', { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Doğan Emlak API çalışıyor.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/feature-definitions', featureDefinitionRoutes);

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} üzerinde çalışıyor.`);
});
