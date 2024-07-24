const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const getCVs = require('../../Controllers/CVmanagement/getCVs');


// Common function to generate a unique filename
const generateFilename = (file) => {
    const basename = path.basename(file.originalname, path.extname(file.originalname));
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDate = `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
    return `${basename}-${formattedDate}${path.extname(file.originalname)}`;
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/excelOfCVs/'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, generateFilename(file));
    }
});

const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/CVs/'); // Destination folder for uploaded resumes
    },
    filename: (req, file, cb) => {
        cb(null, generateFilename(file));
    }
});

const upload = multer({ storage });
const resumeUpload = multer({ storage: resumeStorage });

router.get('/getCVs', getCVs.getAllCVs);

router.post('/importexcel', upload.single('file'), getCVs.importExcel);

router.patch('/uploadresume/:id', resumeUpload.single('resume'), getCVs.uploadResume);

router.get('/downloadresume/:id', getCVs.exportResumes);

module.exports = router;
