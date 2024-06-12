const express = require('express');
const router = express.Router();
const reportAndAnalysis = require('../Controllers/reportAndAnalysis');

router.get('/reportandanalysis', reportAndAnalysis.reportAndAnalysis);

module.exports = router;