const express = require('express');
const router = express.Router();
const permissionController = require('../Controllers/permissionController');

router.post('/permission', permissionController.createPermission);

module.exports = router;
