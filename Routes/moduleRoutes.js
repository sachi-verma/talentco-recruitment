const express = require('express');
const router = express.Router();
const moduleController = require('../Controllers/moduleController');

router.post('/module', moduleController.createModule);
router.get('/getmodules', moduleController.getModule);
router.get('/getmodule/:id', moduleController.getModuleById);
router.put('/updatemodule/:id', moduleController.updateModule);
router.delete('/deletemodule/:id', moduleController.deleteModule);

module.exports = router;
