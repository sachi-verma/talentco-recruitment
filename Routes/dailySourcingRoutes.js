const express = require('express');
const router = express.Router();
const dailySourcingController = require('../Controllers/dailySourcingController');


router.get('/getcompanies', dailySourcingController.getCompanies);
router.get('/getcompanies/:companyId/positions', dailySourcingController.getPositionsOfCompany );
// router.post('/sourcingreport', dailySourcingController.createSourcingReport);
router.post('/addsourcingreport', dailySourcingController.addSourcingReport);
router.post('/bulksourcingreport', dailySourcingController.createBulkSourcingReport);
router.get('/filteredupdate', dailySourcingController.getFilteredUpdate);
router.get('/getsourcingreport', dailySourcingController.getSourcingReport);
router.patch('/statuschange/:id', dailySourcingController.statusChange);


module.exports = router;