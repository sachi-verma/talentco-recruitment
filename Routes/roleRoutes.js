const express = require('express');
const router = express.Router();
const roleController = require('../Controllers/roleController');

router.post('/role', roleController.createRole);
router.get('/getroles', roleController.getRole);
router.get('/getrole/:id', roleController.getRoleById);
router.put('/updaterole/:id', roleController.updateRole);

module.exports = router;
