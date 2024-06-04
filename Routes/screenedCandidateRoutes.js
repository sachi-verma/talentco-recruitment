const express = require('express');
const router = express.Router();
const screenedCandidateController = require('../Controllers/screenedCandidateController');

router.get('/screenedcandidate', screenedCandidateController.getScreenedCandidate);

module.exports = router;