const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

async function createRedisAdapter(redisUrl) {
  try {
    console.log(`\n🔴 REDIS │ Connecting to ${redisUrl} ...`);

    const pubClient = createClient({
      url: redisUrl,
      socket: { connectTimeout: 3000, reconnectStrategy: false },
    });
    const subClient = pubClient.duplicate({
      socket: { connectTimeout: 3000, reconnectStrategy: false },
    });

    pubClient.on('error', () => {});
    subClient.on('error', () => {});

    await Promise.all([pubClient.connect(), subClient.connect()]);

    const adapter = createAdapter(pubClient, subClient);

    console.log('🔴 REDIS │ ✅ Connected — horizontal scaling ENABLED');
    console.log('🔴 REDIS │    Rooms and events synced across ALL server instances\n');

    return adapter;

  } catch (err) {
    console.warn(`\n🔴 REDIS │ ⚠️  Connection failed: ${err.message}`);
    console.warn('🔴 REDIS │    Falling back to IN-MEMORY mode (single instance only)');
    console.warn('🔴 REDIS │    To enable scaling: start Redis on', redisUrl, '\n');
    return null;
  }
}

module.exports = { createRedisAdapter };
