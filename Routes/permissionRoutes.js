const express = require('express');
const router = express.Router();
const permissionController = require('../Controllers/permissionController');

router.post('/permission', permissionController.createPermission);
router.get('/getpermissions', permissionController.getPermission);
router.get('/getpermission/:id', permissionController.getPermissionById);

module.exports = router;
