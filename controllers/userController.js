// Express route handlers for user resources; rely on the service layer for business logic.
const userService = require('../services/userService');
const { buildResponse } = require('../utils/apiResponse');
const { buildRedisClient } = require('../config/redis');

const redisClient = buildRedisClient();
const IDEMPOTENCY_PREFIX = 'IDEMPOTENCY:CREATE_USER:';
const IDEMPOTENCY_CACHE_TTL_SECONDS = 60 * 30; // Cache idempotent responses for 30 minutes.
// const IDEMPOTENCY_PENDING_TTL_SECONDS = 60 * 5; // Pending locks expire after 5 minutes.

const buildIdempotencyCacheKey = (idempotencyKey) => `${IDEMPOTENCY_PREFIX}${idempotencyKey}`;

const parseCacheEntry = (value) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to parse idempotency cache entry:', error.message);
    return null;
  }
};

const readIdempotencyEntry = async (redisKey) => {
  try {
    const cached = await redisClient.get(redisKey);
    return parseCacheEntry(cached);
  } catch (error) {
    console.error('Redis GET failed (idempotency):', error.message);
    return null;
  }
};

const setPendingIdempotencyEntry = async (redisKey) => {
  try {
    const result = await redisClient.set(
      redisKey,
      JSON.stringify({ status: 'PENDING', updatedAt: Date.now() }),
      {
        NX: true,
        EX: IDEMPOTENCY_PENDING_TTL_SECONDS,
      },
    );
    return result === 'OK';
  } catch (error) {
    console.error('Redis SET failed (pending idempotency):', error.message);
    return false;
  }
};

const persistIdempotencyResult = async (redisKey, statusCode, payload) => {
  try {
    await redisClient.set(
      redisKey,
      JSON.stringify({
        status: 'COMPLETED',
        statusCode,
        body: payload,
      }),
      {
        EX: 30,
      },
    );
  } catch (error) {
    console.error('Redis SET failed (idempotency result):', error.message);
  }
};

const clearIdempotencyEntry = async (redisKey) => {
  try {
    await redisClient.del(redisKey);
  } catch (error) {
    console.error('Redis DEL failed (idempotency):', error.message);
  }
};
const {APIError, APIErrorNotFound, APIErrorUnauthorized} = require("../utils/apiError");

// GET /users - returns a list of the latest users (supports pagination).
const getUsers = async (req, res, next) => {
  return next(new APIError({message: "check", statusCode:400}))
  try {
    const { data, meta } = await userService.findAll(req.query);
    res.json(buildResponse(data, 'success', meta));
  } catch (error) {
    next(error);
  }
};

// GET /users/:id - fetch a single user or respond with appropriate error.
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.findById(req.params);
    return res.json(buildResponse(user));
  } catch (error) {
    if (error.status === 404) {
      return next(new APIErrorNotFound("USER"))
      // return res.status(error.status).json(buildResponse(null, error.message));
    }
    return next(error);
  }
};

// POST /users - validate payload and create a new user.
const createUser = async (req, res, next) => {
  // const idempotencyKey = req.get('idempotency-key');
  // if (!idempotencyKey) {
  //   return res
  //     .status(400)
  //     .json(buildResponse(null, 'Idempotency-Key header is required to create a user'));
  // }
  //
  // const redisKey = buildIdempotencyCacheKey(idempotencyKey);
  //
  // const cachedEntry = await readIdempotencyEntry(redisKey);
  // if (cachedEntry) {
  //   if (cachedEntry.status === 'COMPLETED' && cachedEntry.statusCode && cachedEntry.body) {
  //     return res.status(cachedEntry.statusCode).json(cachedEntry.body);
  //   }
  //
  //   if (cachedEntry.status === 'PENDING') {
  //     return res
  //       .status(409)
  //       .json(buildResponse(null, 'A request with this Idempotency-Key is already in progress'));
  //   }
  // }
  //
  // const lockAcquired = await setPendingIdempotencyEntry(redisKey);
  // if (!lockAcquired) {
  //   const entry = await readIdempotencyEntry(redisKey);
  //   if (entry && entry.status === 'COMPLETED' && entry.statusCode && entry.body) {
  //     return res.status(entry.statusCode).json(entry.body);
  //   }
  //
  //   return res
  //     .status(409)
  //     .json(buildResponse(null, 'A request with this Idempotency-Key is already in progress'));
  // }

  try {
    const created = await userService.create(req.body);
    const payload = buildResponse(created, 'User created');

    // await persistIdempotencyResult(redisKey, 201, payload);

    return res.status(201).json(payload);
  } catch (error) {
    if (error.status === 422) {
      const payload = buildResponse(
        { errors: error.errors || [] },
        error.message || 'Validation failed',
      );
      // await persistIdempotencyResult(redisKey, 422, payload);
      return res.status(422).json(payload);
    }

    // await clearIdempotencyEntry(redisKey);
    return next(error);
  }
};

// PUT /users/:id - merge new data into an existing user.
const updateUser = async (req, res, next) => {
  try {
    const updated = await userService.update(req.params.id, req.body);
    return res.json(buildResponse(updated, 'User updated'));
  } catch (error) {
    switch (error.status) {
        case 404:
            return res.status(404).json(buildResponse(null, error.message));
        case 422:
            return res
            .status(422)
            .json(buildResponse({ errors: error.errors || [] }, error.message || 'Validation failed'));
    }

    return next(error);
  }
};

// DELETE /users/:id - remove the user permanently.
const deleteUser = async (req, res, next) => {
  // try {
    const removed = await userService.remove(req.params.id);

    if (!removed) {
      const error = new Error('User not found');
      error.status = 404;
      return next(error);
    }

    return res.status(204).send();
  // } catch (error) {
  //   return next(error);
  // }
};

const updateUserPassword = async (req, res, next) => {
  try {
    const updated = await userService.updatePassword(req.params.id, req.body);
    return res.json(buildResponse(updated, 'User password updated'));
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json(buildResponse(null, error.message));
    }

    if (error.status === 422) {
      return res
        .status(422)
        .json(buildResponse({ errors: error.errors || [] }, error.message || 'Validation failed'));
    }

    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const authenticated = await userService.authenticate(req.body);
    if (authenticated == null) {
      return next(new APIErrorUnauthorized("Invalid Email or Password"))
    }

    return res.json(buildResponse(authenticated, 'User authenticated'));
  } catch (error) {
    if (error.status === 422) {
      return res
        .status(422)
        .json(buildResponse({ errors: error.errors || [] }, error.message || 'Validation failed'));
    }
    return next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPassword,
  loginUser,
};
