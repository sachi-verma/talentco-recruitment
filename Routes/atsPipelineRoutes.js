const express = require('express');
const router = express.Router();
const atsPipelineController = require('../Controllers/atsPipelineController');
const multer = require('multer');
const path = require('path');

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        cb(null, file.originalname);
    }
    });

const upload = multer({ storage });


router.get('/getatspipeline', atsPipelineController.getAtsPipeline);
router.patch('/editatspipeline/:id', upload.single('jd_upload'), atsPipelineController.editAtsPipeline );
router.patch('/atsstatus/:id', atsPipelineController.editAtsStatus);
router.get('/statushistory/:id', atsPipelineController.getStatusHistory);


module.exports = router;