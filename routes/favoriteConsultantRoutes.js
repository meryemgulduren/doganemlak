const express = require('express');
const { list, add, remove, sync } = require('../controllers/favoriteConsultantController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', list);
router.post('/sync', sync);
router.post('/:consultantId', add);
router.delete('/:consultantId', remove);

module.exports = router;
