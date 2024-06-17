const express = require('express');
const router = express.Router();
const dailySourcingController = require('../Controllers/dailySourcingController');
const getDailysourcingPagination = require('../Controllers/getDailysourcingPagination');
const getDailySourcingByDateController = require('../Controllers/getDailySourcingByDateController');
const multer = require('multer');
const path = require('path');

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        //cb(null, file.originalname);
    }
    });

const upload = multer({ storage });


router.get('/getcompanies', dailySourcingController.getCompanies);
router.get('/getcompanies/:companyId/positions', dailySourcingController.getPositionsOfCompany );
// router.post('/sourcingreport', dailySourcingController.createSourcingReport);
router.post('/addsourcingreport', upload.single('candidate_resume'), dailySourcingController.addSourcingReport);
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