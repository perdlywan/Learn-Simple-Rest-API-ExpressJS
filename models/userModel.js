const connection = require('../config/database');
const {APIErrorNotFound} = require('../utils/apiError');
const redis = require('../config/redis');

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
        const [results] = await connection.query('SELECT * FROM users WHERE deleted_at IS NULL');

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
        const cacheKey = `user:${user_id}`;

         // 1. cek cache
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (err) {
            console.error('Redis GET error:', err);
        }

        // 2. query DB
        const [rows] = await connection.query(
            'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
            [user_id]
        );

        if (rows.length === 0) {
            throw new APIErrorNotFound('User');
        }

        const user = rows[0];

           // 3. set cache (TTL 5 menit)
        try {
            await redis.set(cacheKey, JSON.stringify(user), {
                EX: 300
            });
        } catch (err) {
            console.error('Redis SET error:', err);
        }

        return user;
    }

    static async deleteById(user_id) {
        const [results] = await connection.query('UPDATE users set deleted_at = Now() WHERE id = ?', [user_id]);
        
        if (results.affectedRows > 0) {
            await redis.del(`user:${user_id}`);
            return true;
        }

        return false;
    }

    static async updateById(user_id, userData) {
        const {name, email} = userData;
        const [results] = await connection.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, user_id]);

         
        if (results.affectedRows > 0) {
            await redis.del(`user:${user_id}`);
            return true;
        }

        return false;
    }
}

module.exports = User;