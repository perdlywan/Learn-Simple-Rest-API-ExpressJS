// Central router that aggregates feature-specific routers.
const express = require('express');
const userRoutes = require('./userRoutes');
const exampleRoutes = require('./exampleRoutes');
const redisRateLimiter = require('../middlewares/redisRateLimiter');

const router = express.Router();

router.use('/users', redisRateLimiter, userRoutes); // Mount user endpoints with Redis rate limiting.
router.use('/examples', exampleRoutes); // Mount sample/demo endpoints.

module.exports = router;
