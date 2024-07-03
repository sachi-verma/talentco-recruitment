const express = require('express');
const router = express.Router();
const assignRecruiterController = require('../Controllers/assignRecruiterController');
const getRecruiterPagination = require('../Controllers/getRecruiterPagination');

router.get('/getrecruiter', assignRecruiterController.getRecruiter);
router.post('/recruiter/:id', assignRecruiterController.assignRecruiter);

//new route
router.get('/getrecruiterbypage', getRecruiterPagination.getRecruiterByPage);

router.delete('/deleteassingrecruiter/:id', assignRecruiterController.deleteAssignRecruiter);


module.exports = router;