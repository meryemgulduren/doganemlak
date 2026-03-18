const express = require('express');
const { getCities, getDistricts, getNeighborhoods } = require('../controllers/cityController');

const router = express.Router();

/**
 * @route GET /api/cities
 */
router.get('/', getCities);

/**
 * @route GET /api/cities/:province/districts
 */
router.get('/:province/districts', getDistricts);

/**
 * @route GET /api/cities/:province/districts/:district/neighborhoods
 */
router.get('/:province/districts/:district/neighborhoods', getNeighborhoods);

module.exports = router;
