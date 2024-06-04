const express = require('express');
const router = express.Router();
const dailySourcingController = require('../Controllers/dailySourcingController');
const getDailysourcingPagination = require('../Controllers/getDailysourcingPagination');
const getDailySourcingByDateController = require('../Controllers/getDailySourcingByDateController');


router.get('/getcompanies', dailySourcingController.getCompanies);
router.get('/getcompanies/:companyId/positions', dailySourcingController.getPositionsOfCompany );
// router.post('/sourcingreport', dailySourcingController.createSourcingReport);
router.post('/addsourcingreport', dailySourcingController.addSourcingReport);
router.post('/bulksourcingreport', dailySourcingController.createBulkSourcingReport);
router.get('/filteredupdate', dailySourcingController.getFilteredUpdate);
router.get('/getsourcingreport', dailySourcingController.getSourcingReport);
router.patch('/statuschange/:id', dailySourcingController.statusChange);
router.get('/getadminreport', dailySourcingController.getAdminReport);
router.get('/filteredadmin', dailySourcingController.getFilteredAdmin);

//new route
router.get('/getsourcingreportbypage',getDailysourcingPagination.getSourcingReportByPage);
router.get('/getadminreportbypage',getDailysourcingPagination.getAdminReportByPage);

router.get('/getfilteredupdatebypage', getDailysourcingPagination.getFilteredUpdateByPage);

router.get('/getSourcingReportByDate', getDailySourcingByDateController.getSourcingReportByDate);



module.exports = router;