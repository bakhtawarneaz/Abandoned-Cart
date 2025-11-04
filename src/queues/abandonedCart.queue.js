const Queue = require('bull');
const redis = require('../config/redis');
const { processAbandonedCartJob } = require('../workers/abandonedCart.worker');

const abandonedCartQueue = new Queue('abandoned-cart-queue', {
  redis: { host: redis.options.host, port: redis.options.port },
});

// Register the worker that processes jobs
abandonedCartQueue.process(processAbandonedCartJob);

module.exports = abandonedCartQueue;
