const express = require('express');
const router = express.Router();
const assignRecruiterController = require('../Controllers/assignRecruiterController');

router.patch('/recruiter/:id', assignRecruiterController.assignRecruiter);

module.exports = router;