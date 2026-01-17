const User = require('../models/userModel');
const APIErrorNotFound = require('../utils/apiError');

let users = [
    new User(1, 'John Doe', "aaa@gmail.com"),
    new User(2, 'Jane Doe', "bbb@gmail.com"),
    new User(3, 'John Smith', "ccc@gmail.com")
];

const tryError = async (req, res, next) => {
    let varError = Error("Ini adalah error coba coba")
    varError.status = 400
    next(varError)
}

const getUsers = async (req, res) => {
    const users = await User.findAll();

    res
        .status(200)
        .json(users);
}

const createUser = async (req, res) => {
    const errValidateBody = validateBody(req.body);

    if (errValidateBody.length > 0) {
        return res
            .status(400)
            .json(errValidateBody);
    }

    const {name, email} = req.body;

    const newUser = await User.createUser({name, email});

    res
        .status(201)
        .json(newUser);
}

const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.user_id);
        return res.json(user);
    } catch (error) {
        return next(error);
    }
}

const deleteUserById = async (req, res) => {
    const {user_id} = req.params;

    const getUserById = await User.findById(user_id);

    if (getUserById.length === 0) {
        res
            .status(404)
            .json({message: "User not found"});
    }

    const deleteUser = await User.deleteById(user_id);

    if (!deleteUser) {
        res
            .status(500)
            .json({message: "Error deleting user"});
    } else {
            res
            .status(204)
            .json({message: "User deleted"});
    }
}

const updateUserById = async (req, res) => {
    const {user_id} = req.params;
    
    const getUserById = await User.findById(user_id);

    if (getUserById.length === 0) {
        res
            .status(404)
            .json({message: "User not found"});
    }

    const errValidateBody = validateBody(req.body);

    if (errValidateBody.length > 0) {
        return res
            .status(400)
            .json(errValidateBody);
    }

    const updateUser = await User.updateById(user_id, req.body);

    if(!updateUser){
        res
            .status(500)
            .json({message: "Error updating user"});
    } else {
        res
            .status(200)
            .json({message: "User updated"});
    }
}

const validateBody = (body = {}) => {
    // validation
    let errorValidation = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!body.name) {
        errorValidation.push({field: "name", message: "Name is required"});
    }

    if (!body.email){
        errorValidation.push({field: "email", message: "Email is required"});
    }

    if (body.email && !emailRegex.test(body.email)){
        errorValidation.push({field: "email", message: "Invalid email format"});
    }

    if (body.email.includes("@test.com")){
        errorValidation.push({field: "email", message: "Email cannot be @test.com"});
    }

    return errorValidation;
}

module.exports = {
    getUsers,
    createUser,
    getUserById,
    deleteUserById,
    updateUserById,
    tryError
}