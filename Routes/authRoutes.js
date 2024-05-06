const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');

router.get('/login', authController.getAuth)

module.exports = router;