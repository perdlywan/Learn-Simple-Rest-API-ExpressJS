const User = require('../model/userModel');

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

const getUserById = async (req, res) => {
    const {user_id} = req.params;
    
    const getUserById = await User.findById(user_id);

    console.log(getUserById);

    if (getUserById.length > 0) {
        res
            .status(200)
            .json(getUserById);
    } else {
        res
            .status(404)
            .json({message: "User not found"});
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
    let errorValidation = []

    if (!body.name) {
        errorValidation.push({field: "name", message: "Name is required"})
    }

    return errorValidation
}

module.exports = {
    getUsers,
    createUser,
    getUserById,
    deleteUserById,
    updateUserById,
    tryError
}