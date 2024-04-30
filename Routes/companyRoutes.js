const express = require('express');
const router = express.Router();
const companyController = require('../Controllers/companyController');

router.post('/companyregistration', companyController.registerCompany);
router.get('/getcompany', companyController.getCompany);
router.get('/getcompany/:id', companyController.getCompanyById);
router.put('/updatecompany/:id', companyController.updateCompany);

module.exports = router;
