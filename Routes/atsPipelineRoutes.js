const express = require('express');
const router = express.Router();
const atsPipelineController = require('../Controllers/atsPipelineController');


router.get('/getatspipeline', atsPipelineController.getAtsPipeline);
router.patch('/editatspipeline/:id', atsPipelineController.editAtsPipeline );


module.exports = router;