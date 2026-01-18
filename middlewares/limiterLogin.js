// Global rate limiter middleware powered by express-rate-limit.
const rateLimit = require('express-rate-limit');

const limiterLogin = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    max: 3, // 300 requests per IP/path per window
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `${req.ip}:${req.baseUrl || ''}${req.path}`,
    handler: (req, res) => {
        res.status(429).json({
            message: 'Too many requests',
            data: null,
        });
    },
});

module.exports = limiterLogin;
