const express = require('express');
const router = express.Router();
const interviewController = require('../Controllers/interviewController');
const atsPipelineController = require('../Controllers/atsPipelineController');

router.get('/candidates', interviewController.getCandidates);
router.get('/getinterview', interviewController.getInterviewSchedule);
router.post('/addinterview', interviewController.addInterviewSchedule);
router.patch('/editinterview/:id', interviewController.editInterviewSchedule);
router.post('/bulkinterview', interviewController.bulkInterviewSchedule);


//new
//router.post('/schduleinterview',atsPipelineController.sechduleInterview);
router.get('/existedcandidate', interviewController.candidateExist);
router.patch('/updateinterviewdetails/:id', interviewController.updateInterviewDetails);


module.exports = router;