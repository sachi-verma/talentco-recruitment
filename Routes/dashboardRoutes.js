const express = require('express');
const router = express.Router();
const getDashBoradReportController = require('../Controllers/getDashboardReportController');

router.get('/getdashboardreport', getDashBoradReportController.getDashBoradReport);

module.exports = router;