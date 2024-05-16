const express = require('express');
const router = express.Router();
const dailySourcingController = require('../Controllers/dailySourcingController');

router.post('/sourcingreport', dailySourcingController.createSourcingReport);
router.post('/bulksourcingreport', dailySourcingController.createBulkSourcingReport);
router.get('/filteredupdate', dailySourcingController.getFilteredUpdate);
router.get('/getsourcingreport', dailySourcingController.getSourcingReport);


module.exports = router;