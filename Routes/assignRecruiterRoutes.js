const express = require('express');
const router = express.Router();
const assignRecruiterController = require('../Controllers/assignRecruiterController');

router.get('/getrecruiter', assignRecruiterController.getRecruiter);
router.patch('/recruiter/:id', assignRecruiterController.assignRecruiter);

module.exports = router;