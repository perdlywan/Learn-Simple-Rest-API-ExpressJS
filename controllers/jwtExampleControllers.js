// Demo endpoints for generating and verifying JWT tokens.
const jwt = require('jsonwebtoken');
const { buildResponse } = require('../utils/apiResponse');
const { env } = require('../config/env');

const buildDemoPayload = (customPayload = {}) => ({
  sub: customPayload.sub || 'demo-user',
  role: customPayload.role || 'viewer',
  issuedAt: new Date().toISOString(),
    ...customPayload,
});

// POST /examples/jwt/generate - issues a signed JWT with a sample payload.
const generateJwt = (req, res, next) => {
  try {
    const payload = buildDemoPayload(req.body || {});
    const token = jwt.sign(payload, "key-secret-kita", { expiresIn: "1d" });

    return res.json(
      buildResponse(
        {
          token,
          expiresIn: env.jwt.expiresIn,
          payload,
        },
        'JWT generated',
      ),
    );
  } catch (error) {
    return next(error);
  }
};

const extractToken = (req) => {
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  if (req.body && req.body.token) {
    return req.body.token;
  }

  if (req.query && req.query.token) {
    return req.query.token;
  }

  return null;
};

// POST /examples/jwt/verify - validates a token and returns the decoded payload.
const verifyJwt = (req, res) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(400).json(buildResponse(null, 'Token is required'));
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    return res.json(
      buildResponse(
        {
          valid: true,
          decoded,
        },
        'Token verified',
      ),
    );
  } catch (error) {
    return res.status(401).json(
      buildResponse(
        {
          valid: false,
          reason: error.message,
        },
        'Token verification failed',
      ),
    );
  }
};

module.exports = {
  generateJwt,
  verifyJwt,
};
