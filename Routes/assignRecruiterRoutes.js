const express = require('express');
const router = express.Router();
const assignRecruiterController = require('../Controllers/assignRecruiterController');
const getRecruiterPagination = require('../Controllers/getRecruiterPagination');

router.get('/getrecruiter', assignRecruiterController.getRecruiter);
router.patch('/recruiter/:id', assignRecruiterController.assignRecruiter);

//new route
router.get('/getrecruiterbypage', getRecruiterPagination.getRecruiterByPage);


module.exports = router;