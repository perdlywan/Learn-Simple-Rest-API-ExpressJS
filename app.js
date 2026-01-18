// Initializes the Express application and wires middleware + routes used by the server entry point.
const express = require('express');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const { notFoundHandler } = require('./middlewares/notFoundHandler');
const { errorHandler } = require('./middlewares/errorHandler');
const { env } = require('./config/env');
const rateLimiter = require('./middlewares/rateLimiter');
const {authenticationStatefulMiddleware} = require("./middlewares/authenticationMiddleware");
const {authorizationMiddleware} = require("./middlewares/authorizationMiddleware");
const {buildRedisClient} = require("./config/redis");

// Exported instance so tests or the HTTP server can reuse the same configured app.
const app = express();
app.enable('trust proxy'); // Required so limiter can read real client IP behind proxies.

app.use(express.json()); // Parse JSON bodies before hitting routes.
app.use(cookieParser(env.cookieSecret)); // Populate req.cookies/signedCookies.
app.use(rateLimiter); // Throttle incoming requests per IP/path.
app.use('/api', routes); // All API routes share a common /api prefix.

app.get('/authentication', authenticationStatefulMiddleware, authorizationMiddleware("admin"), (req, res) => {
    res.status(200).json({
        message: 'Authenticated access granted',
        data: req.authenticationData
    });
})

app.get("/logout", authenticationStatefulMiddleware,  async (req, res) => {
    const redisClient = buildRedisClient()
    const token = req.authenticationData.token;

    const expiresIn = req.authenticationData.data.exp - Math.floor(Date.now() / 1000);
    await redisClient.set("AUTH_LOGOUT:" + token, "true", {
        EX: expiresIn // Logout status valid for 15 minutes
    })
    return res.status(200).json({
        message: 'Successfully logged out',
        data: null
    })


})

app.use(notFoundHandler); // Handle unmatched routes with a 404 payload.
app.use(errorHandler); // Central error formatter/logger so responses remain consistent.

module.exports = app;
