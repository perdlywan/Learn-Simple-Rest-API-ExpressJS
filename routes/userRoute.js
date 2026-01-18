// Defines the HTTP routes for user resources and maps them to controllers.
const express = require('express');
const userController = require('../controllers/userController');
const {asyncHandler} = require("../middlewares/asyncHandler");
const limiterLogin = require ("../middlewares/limiterLogin")
const router = express.Router();

router
  .route('/')
  .get(userController.getUsers) // List users.
  .post(userController.createUser); // Create a new user.

router.post('/login', userController.loginUser); // Login endpoint returning true/false.

router
  .route('/:id')
  .get(asyncHandler(userController.getUserById)) // Retrieve one user.
  .put(userController.updateUser) // Replace/update user data.
  .delete(asyncHandler(userController.deleteUser)); // Remove the user.

router.patch('/:id/password', userController.updateUserPassword); // Update password only.

module.exports = router;
