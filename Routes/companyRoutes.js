const express = require('express');
const router = express.Router();
const companyController = require('../Controllers/companyController');
const getCompanyPagination = require('../Controllers/getCompanyPagination');

router.post('/companyregistration', companyController.registerCompany);
router.get('/getcompany', companyController.getCompany);
router.get('/getcompany/:id', companyController.getCompanyById);
router.put('/updatecompany/:id', companyController.updateCompany);
router.delete('/deletecompany/:id', companyController.deleteCompany);


//new route

router.get('/getcompanybypage',getCompanyPagination.getCompanyByPage);

module.exports = router;
