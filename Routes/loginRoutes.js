const express = require('express');
const router = express.Router();
const loginController = require('../Controllers/loginController');


router.post('/login', loginController.loginAccess);
router.get('/verify', loginController.verifyAccess);


module.exports = router;