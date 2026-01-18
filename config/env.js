// Loads environment variables from .env and exposes a typed config object.
const dotenv = require('dotenv');

dotenv.config();

// Central place to read env vars, apply defaults, and share across the app.
const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  cookieSecret: process.env.COOKIE_SECRET || 'cookie-demo-secret',
  jwt: {
    secret: process.env.JWT_SECRET || 'jwt-demo-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'practice_express',
  },
};

module.exports = { env };
