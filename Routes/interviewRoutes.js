const express = require('express');
const router = express.Router();
const interviewController = require('../Controllers/interviewController');

router.get('/candidates', interviewController.getCandidates);
router.get('/getinterview', interviewController.getInterviewSchedule);
router.post('/addinterview', interviewController.addInterviewSchedule);
router.patch('/editinterview/:id', interviewController.editInterviewSchedule);


module.exports = router;