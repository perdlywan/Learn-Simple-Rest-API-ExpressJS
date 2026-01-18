// Central Redis client setup; connection occurs once at server startup.
const { createClient } = require('redis');
const { env } = require('./env');

let client;
let connectPromise;

const buildRedisClient = () => {
  if (client) {
    return client;
  }

  const { url, host, port, password } = env.redis;
  client = createClient({
    url: url || `redis://${password ? `:${password}@` : ''}${host}:${port}/10`,
  });

  client.on('error', (err) => {
    console.error('[Redis] connection error:', err.message);
  });

  client.on('ready', () => {
    console.log('[Redis] connected successfully');
  });

  return client;
};

const connectRedisClient = async () => {
  const redisClient = buildRedisClient();
  if (redisClient.isOpen) {
    return redisClient;
  }

  if (!connectPromise) {
    connectPromise = redisClient.connect().catch((error) => {
      connectPromise = null;
      throw error;
    });
  }

  await connectPromise;
  return redisClient;
};

const initRedis = connectRedisClient;

module.exports = {
  buildRedisClient,
  initRedis,
  connectRedisClient,
};
