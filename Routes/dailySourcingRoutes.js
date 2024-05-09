const express = require('express');
const router = express.Router();
const dailySourcingController = require('../Controllers/dailySourcingController');

router.post('/sourcingreport', dailySourcingController.createSourcingReport)


module.exports = router;