const express = require('express');
const router = express.Router();
const jobController = require('../Controllers/jobController');
const multer = require('multer');
const path = require('path');

const getJobPagination = require('../Controllers/getJobPagination');

const exportJobsController = require('../Controllers/exportJobsController');

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
       // cb(null, path.basename(file.originalname) +'-'+ Date.now() + path.extname(file.originalname));
        const basename = path.basename(file.originalname, path.extname(file.originalname));
        // Create new filename with current date and original extension
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        // Format date as "YYYYMMDD-HHmmss"
        const formattedDate = `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;

        const newFilename = `${basename}-${formattedDate}${path.extname(file.originalname)}`;
        cb(null, newFilename);
    }
    });

const upload = multer({ storage });

router.post('/job', upload.single('jd_upload'), jobController.createJob);
// router.post('/job', jobController.createJob);
router.get('/getjobs', jobController.getJob);
router.get('/getjob/:id', jobController.getJobById);
router.patch('/updatejob/:id', upload.single('jd_upload'), jobController.updateJob);
router.delete('/deletejob/:id', jobController.deleteJob);

//new route
router.get('/getjobBypage',getJobPagination.getJobByPage);

router.get('/exportAssignRecruiter', exportJobsController.exportJobs);

router.patch('/updatePositionStatus/:id', getJobPagination.updatePositionStatus);

module.exports = router;