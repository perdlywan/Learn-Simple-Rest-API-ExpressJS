const connection = require('../config/database');

class User {
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }

    return() {
        return {
            id: this.id,
            name: this.name,
            email: this.email
        };
    }

    static async findAll() {
        throw new Error("Not implemented")
        
        const [results] = await connection.query('SELECT * FROM users');

        let users = [];

        for (let result of results){
            users.push(new User(result.id, result.name, result.email));
        }

        return users;
    }

    static async createUser(userData){
        const {name, email} = userData;
        const [results] = await connection.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);

        if (results.affectedRows > 0) {
            const [result] = await connection.query('SELECT * FROM users WHERE id = ?', [results.insertId]);
            return new User(result.id, result.name, result.email);
        }
    }

    static async findById(user_id) {
        const [results] = await connection.query('SELECT * FROM users WHERE id = ?', [user_id]);

        let user = [];

        if (results.length > 0){
            user.push(new User(results[0].id, results[0].name, results[0].email));
        }

        return user;
    }

    static async deleteById(user_id) {
        const [results] = await connection.query('DELETE FROM users WHERE id = ?', [user_id]);
        
        if (results.affectedRows > 0) {
            return true;
        }

        return false;
    }

    static async updateById(user_id, userData) {
        const {name, email} = userData;
        const [results] = await connection.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, user_id]);

         
        if (results.affectedRows > 0) {
            return true;
        }

        return false;
    }
}

module.exports = User;