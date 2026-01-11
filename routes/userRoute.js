const express = require('express');
const {getUsers, createUser, getUserById, deleteUserById, updateUserById, tryError} = require('../controller/userController');

const userRouter = express.Router();

userRouter.route("/")
    .get(getUsers)
    .post(createUser);


userRouter.route("/:user_id")
    .get(getUserById)
    .delete(deleteUserById)
    .patch(updateUserById);

userRouter.get("/error", tryError)

module.exports = userRouter;

