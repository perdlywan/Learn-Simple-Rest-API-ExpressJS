const {buildRedisClient} = require("../config/redis");
const {APIErrorUnauthorized} = require("../utils/apiError");
const jwt = require("jsonwebtoken");
const {env} = require("../config/env");
const redisClient = buildRedisClient()

const authenticationStatefulMiddleware = async (req, res, next) => {
    const authorizationHeader = req.get('Authorization');
    const token = authorizationHeader.split(' ')[1] ?? '';

    let decoded = null
    try {
        decoded = jwt.verify(token, "key-secret-kita");

        const result = await redisClient.get(`AUTH_LOGOUT:${token}`)
        if (result != null) {
            return res.status(401).json(new APIErrorUnauthorized());
        }

        req.authenticationData = {
            token: token,
            data: decoded
        }
        return next()
    }catch (err) {
        return res.status(401).json(new APIErrorUnauthorized());
    }
}

module.exports = {authenticationStatefulMiddleware}