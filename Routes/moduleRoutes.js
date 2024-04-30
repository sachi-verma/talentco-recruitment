const express = require('express');
const router = express.Router();
const moduleController = require('../Controllers/moduleController');

router.post('/module', moduleController.createModule);
router.get('/getmodules', moduleController.getModule)

module.exports = router;
