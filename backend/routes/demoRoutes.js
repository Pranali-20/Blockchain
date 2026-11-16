const express = require('express');
const router = express.Router();
const { getSampleRecords, simulateTamper } = require('../controllers/demoController');

router.get('/samples', getSampleRecords);
router.post('/tamper-compare', simulateTamper);

module.exports = router;
