const express = require("express");
const router = express.Router();
const screenedCandidateController = require("../Controllers/screenedCandidatesController");
const getScreenedCandidatesPagination = require("../Controllers/getScreenedCandidatesPagination");

router.get(
  "/screenedcandidate",
  screenedCandidateController.getScreenedCandidate
);

//new routes

router.get(
  "/getscreenedcandidatepagination",
  getScreenedCandidatesPagination.getScreenedCandidatePagination
);
router.get(
  "/getpositionwisescreenedcandidatecount",
  getScreenedCandidatesPagination.getPositionWiseCount
);

module.exports = router;
