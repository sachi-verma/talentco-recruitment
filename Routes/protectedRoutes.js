const express = require('express');
const router = express.Router();
const checkPermission = require('../Middleware/accessControlMiddleware'); 
// Define your protected route
router.get("/:module_id", checkPermission, (req, res) => {
  res.send("You have access!");
});

module.exports = router;