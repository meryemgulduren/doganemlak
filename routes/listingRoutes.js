const express = require('express');
const { list, getById } = require('../controllers/listingController');
const { listByListing, create } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', list);
router.get('/:id/reviews', listByListing);
router.post('/:id/reviews', authenticate, create);
router.get('/:id', getById);

module.exports = router;
