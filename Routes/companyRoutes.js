const express = require('express');
const router = express.Router();
const companyController = require('../Controllers/companyController');

router.post('/companyregistration', companyController.registerCompany);
router.get('/getcompany', companyController.getCompany)

module.exports = router;
