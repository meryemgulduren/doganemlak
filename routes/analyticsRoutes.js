/**
 * routes/analyticsRoutes.js
 *
 * Admin analitiği endpoint'leri.
 * Tüm route'lar authenticate + requireAdmin middleware'i ile korunur.
 */

const express = require('express');
const { getAnalyticsSummary } = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/summary', getAnalyticsSummary);

module.exports = router;
