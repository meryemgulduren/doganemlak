const express = require('express');
const {
  getStats,
  listAllListings,
  createListing,
  updateListing,
  deleteListing,
  createAdmin,
  listAdmins,
  deleteAdmin,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { validateListing } = require('../middleware/listingValidation');

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

// İstatistik
router.get('/stats', getStats);

// İlan CRUD
router.get('/listings',        listAllListings);
router.post('/listings',       validateListing, createListing);
router.put('/listings/:id',    validateListing, updateListing);
router.delete('/listings/:id', deleteListing);

// Admin kullanıcı yönetimi
router.get('/admins',       listAdmins);
router.post('/admins',      createAdmin);
router.delete('/admins/:id', deleteAdmin);

module.exports = router;

