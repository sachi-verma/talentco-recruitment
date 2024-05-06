const express = require('express');
const router = express.Router();
const permissionController = require('../Controllers/permissionController');

router.post('/permission', permissionController.createPermission);
router.get('/getpermissions', permissionController.getPermission);
router.get('/getpermission/:id', permissionController.getPermissionById);
router.get('/getpermissiondetails', permissionController.getPermissionDetails);
router.get('/getpermissiondetail/:id', permissionController.getPermissionDetailsById);
router.put('/updatepermission/:id', permissionController.updatePermission);
router.delete('/deletepermission/:id', permissionController.deletePermission);

module.exports = router;
