const express = require('express');
const router = express.Router();
const downloadFileController = require("../Controllers/downloadFilesController")

router.get('/downloadresume/:id',downloadFileController.exportResumes);
router.get('/downloadJD/:id',downloadFileController.exportJD);

module.exports = router;