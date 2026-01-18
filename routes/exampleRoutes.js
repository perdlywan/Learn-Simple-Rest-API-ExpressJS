// Routes for showcasing simple examples/endpoints.
const express = require('express');
const { cookieExample, signedCookieExample } = require('../controllers/cookieExampleController');
const { generateJwt, verifyJwt } = require('../controllers/jwtExampleController');

const router = express.Router();

router.get('/cookies', cookieExample); // GET /api/examples/cookies.
router.get('/signed-cookies', signedCookieExample); // GET /api/examples/signed-cookies.
router.post('/jwt/generate', generateJwt); // POST /api/examples/jwt/generate.
router.post('/jwt/verify', verifyJwt); // POST /api/examples/jwt/verify.

module.exports = router;
