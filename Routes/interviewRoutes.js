const express = require("express");
const router = express.Router();
const interviewController = require("../Controllers/interviewController");
const atsPipelineController = require("../Controllers/atsPipelineController");

router.get("/candidates", interviewController.getCandidates);
router.get("/getinterview", interviewController.getInterviewSchedule);
router.post("/addinterview", interviewController.addInterviewSchedule);
router.patch("/editinterview/:id", interviewController.editInterviewSchedule);
router.post("/bulkinterview", interviewController.bulkInterviewSchedule);

//new
//router.post('/schduleinterview',atsPipelineController.sechduleInterview);
router.get("/existedcandidate", interviewController.candidateExist);
router.patch(
  "/updateinterviewdetails/:id",
  interviewController.updateInterviewDetails
);
router.patch(
  "/updateinterviewstatus/:id",
  interviewController.updateInterviewStatus
);
router.patch("/markinterviewdone/:id", interviewController.markInterviewDone);

router.get(
  "/getpositionwiseinterviewcandidatecount",
  interviewController.getPositionWiseCount
);

router.get("/getinterviewhistory/:id", interviewController.getInterviewHistory);
router.get("/getinterviewstatushistory/:id", interviewController.getInterviewStatusHistory);

module.exports = router;
