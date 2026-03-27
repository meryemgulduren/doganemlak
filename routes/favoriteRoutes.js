const express = require('express');
const { list, add, remove, sync } = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', list);
router.post('/sync', sync);
router.post('/:listingId', add);
router.delete('/:listingId', remove);

module.exports = router;
