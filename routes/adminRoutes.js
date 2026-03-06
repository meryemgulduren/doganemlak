const express = require('express');
const {
  getStats,
  listAllListings,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { validateListing } = require('../middleware/listingValidation');

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/stats', getStats);
router.get('/listings', listAllListings);
router.post('/listings', validateListing, createListing);
router.put('/listings/:id', validateListing, updateListing);
router.delete('/listings/:id', deleteListing);

module.exports = router;
