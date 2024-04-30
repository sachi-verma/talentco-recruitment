const express = require('express');
const router = express.Router();
const roleController = require('../Controllers/roleController');

router.post('/role', roleController.createRole);
router.get('/getroles', roleController.getRole);

module.exports = router;
