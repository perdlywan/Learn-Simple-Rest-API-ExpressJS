// Provides a thin abstraction over the User model for controllers to depend on.
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const {APIErrorValidation} = require("../utils/apiError");
const { buildRedisClient } = require('../config/redis');
const crypto = require('node:crypto');
const jwt = require("jsonwebtoken");

const redisClient = buildRedisClient();
const BCRYPT_SALT_ROUNDS = 10;

const validateUserPayload = (body = {}) => {
  const errors = [];

  if (!body.name || !body.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!body.email || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      errors.push({ field: 'email', message: 'Email is not valid' });
    }

  }

  if(body.password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  return errors;
};

const validateUserPayloadClass = (user = {}) => {
  const errors = [];

  if (!user.name || !user.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!user.email || !user.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      errors.push({ field: 'email', message: 'Email is not valid' });
    }

  }

  return errors;

}

const validatePasswordPayload = (password) => {
  if (!password || typeof password !== 'string' || !password.trim()) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  return null;
};

const validateLoginPayload = (body = {}) => {
  const errors = [];
  if (!body.email || typeof body.email !== 'string' || !body.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

class UserService {
  async findAll(query = {}) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const perPageParam = query.per_page ?? query.perPage;
    const perPage = Math.max(parseInt(perPageParam, 10) || 10, 1);
    return User.findAll({ page, perPage });
  }

  async findById(params) {
    const userId = params.id ?? params.userId ?? params.user_id;
    const cacheKey = `USER:${userId}`;

    if (!userId) {
      const error = new Error('User ID is required');
      error.status = 400;
      throw error;
    }

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Redis GET failed:', error.message);
    }

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    try {
      let u = new User({
        id: user.id,
        email: user.email + " cache"
      })
      await redisClient.set(cacheKey, JSON.stringify(user), {
        EX: 15, // cache for 5 minutes
      });

    } catch (error) {
      console.error('Redis SET failed:', error.message);
    }

    return user;
  }

  async create(body) {
    let payload = new User({
      name: body.name,
      email: body.email,
      password: body.password
    })

    const errors = validateUserPayload(payload);
    if (errors.length) {
      throw new APIErrorValidation(errors)
    }

    payload.password = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);

    return User.create(payload);
  }

  async update(id, payload = {}) {
    const existing = await User.findById(id);
    if (!existing) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const data = {
      name: payload.name ?? existing.name,
      email: payload.email ?? existing.email,
    };

    return User.update(id, data);
  }

  async remove(id) {
    let user = User.remove(id);
    const cacheKey = `USER:${id}`;
    await redisClient.del(cacheKey)
    return user
  }

  async updatePassword(id, payload = {}) {
    const validationError = validatePasswordPayload(payload.password);
    if (validationError) {
      const error = new Error('Validation failed');
      error.status = 422;
      error.errors = [{ field: 'password', message: validationError }];
      throw error;
    }

    const existing = await User.findById(id);
    if (!existing) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const hashed = await bcrypt.hash(payload.password, BCRYPT_SALT_ROUNDS);
    const updated = await User.updatePassword(id, hashed);

    const cacheKey = `USER:${id}`;
    try {
      await redisClient.del(cacheKey);
    } catch (error) {
      console.error('Redis DEL failed:', error.message);
    }

    return updated;
  }

  async authenticate(payload = {}) {
    const errors = validateLoginPayload(payload);
    if (errors.length) {
      const error = new Error('Validation failed');
      error.status = 422;
      error.errors = errors;
      throw error;
    }

    const record = await User.findWithPasswordByEmail(payload.email);
    if (!record || !record.passwordHash) {
      return false;
    }

    const compare = bcrypt.compare(payload.password, record.passwordHash);
    if (!compare) {
      return null;
    }

    // get roles
    const roles = await User.getUserRoles(record.user.id);

    // stateless process
    const token = jwt.sign({
      userId: record.user.id,
      roles: roles
    }, "key-secret-kita", { expiresIn: 60*60 });

    const expiredAt = Date.now() + 60 * 60 * 1000; // 1 hour

    return {
      token: token,
      expired_at: new Date(expiredAt),
    }

  }
}

module.exports = new UserService();
