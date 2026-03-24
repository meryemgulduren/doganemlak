const express = require('express');
const {
  getStats,
  listAllListings,
  createListing,
  updateListing,
  patchListingStatus,
  deleteListing,
  createAdmin,
  listAdmins,
  updateAdmin,
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
router.patch('/listings/:id/status', patchListingStatus);
router.put('/listings/:id',    validateListing, updateListing);
router.delete('/listings/:id', deleteListing);

// Admin kullanıcı yönetimi
router.get('/admins',       listAdmins);
router.post('/admins',      createAdmin);
router.put('/admins/:id',   updateAdmin);
router.delete('/admins/:id', deleteAdmin);

// Talep/Şikayet yönetimi
const { getComplaints, updateComplaintStatus } = require('../controllers/complaintController');
router.get('/complaints',              getComplaints);
router.put('/complaints/:id/status',   updateComplaintStatus);

module.exports = router;

