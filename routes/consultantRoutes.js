const express = require('express');
const { listPublicConsultants } = require('../controllers/consultantController');

const router = express.Router();

router.get('/', listPublicConsultants);

module.exports = router;
