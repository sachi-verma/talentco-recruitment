const express = require('express');
const router = express.Router();
const emailController = require('../Controllers/emailController');


router.post('/sendemail', emailController.sendMail)


module.exports = router;