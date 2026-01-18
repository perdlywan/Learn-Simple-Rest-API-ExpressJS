const {APIErrorForbidden} = require("../utils/apiError");

const authorizationMiddleware = (roleTag = '') => async (req, res, next) => {
    for (const role of req.authenticationData.data.roles) {
        if (role === roleTag) {
            return next();
        }
    }

    return next(new APIErrorForbidden());
}

module.exports = {authorizationMiddleware};