const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const getUserPagination = require('../Controllers/getUserPagination');

router.post('/user', userController.createUser);
router.get('/getusers', userController.getUser);
router.get('/getuser/:id', userController.getUserById);
router.put('/updateuser/:id', userController.updateUser);
router.delete('/deleteuser/:id', userController.deleteUser);


//new route

router.get('/getuserbyPage', getUserPagination.getUserByPage)

module.exports = router;
 