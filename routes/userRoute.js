const express = require('express');
const {getUsers, createUser, getUserById, deleteUserById, updateUserById, tryError} = require('../controllers/userController');
const {asyncHandler} = require('../middlewares/asyncHandler');

const userRouter = express.Router();

userRouter.route("/")
    .get(getUsers)
    .post(createUser);


userRouter.route("/:user_id")
    .get(asyncHandler(getUserById))
    .delete(deleteUserById)
    .put(updateUserById);

userRouter.get("/error", tryError)

module.exports = userRouter;

