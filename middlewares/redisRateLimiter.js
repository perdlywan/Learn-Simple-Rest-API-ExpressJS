// Redis-backed rate limiter powered by express-rate-limit + rate-limit-redis.
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { connectRedisClient } = require('../config/redis');

const redisRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${req.ip}:${req.baseUrl || ''}${req.path}`, // mimic pathLimiter behavior
  store: new RedisStore({
    sendCommand: async (...args) => {
      const client = await connectRedisClient();
      return client.sendCommand(args);
    },
  }),
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests',
      data: null,
    });
  },
});

module.exports = redisRateLimiter;
