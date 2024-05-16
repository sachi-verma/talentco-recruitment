const express = require('express');
const router = express.Router();
const jobController = require('../Controllers/jobController');
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

router.patch('/job', upload.single('jd_upload'), jobController.createJob);
// router.post('/job', jobController.createJob);
router.get('/getjobs', jobController.getJob);
router.get('/getjob/:id', jobController.getJobById);
router.patch('/updatejob/:id', upload.single('jd_upload'), jobController.updateJob);
router.delete('/deletejob/:id', jobController.deleteJob);

module.exports = router;