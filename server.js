// Entrypoint that boots the Express app with the configured port and environment variables.
const app = require('./app');
const { env } = require('./config/env');
const { initRedis } = require('./config/redis');

const startServer = async () => {
  try {
    await initRedis(); // Initialize Redis connection (unused elsewhere for now).
  } catch (error) {
    console.error('Failed to initialize Redis:', error.message);
  }

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

startServer();
