const express = require('express');
const router = express.Router();
const screenedCandidateController = require('../Controllers/screenedCandidatesController');

router.get('/screenedcandidate', screenedCandidateController.getScreenedCandidate);

module.exports = router;