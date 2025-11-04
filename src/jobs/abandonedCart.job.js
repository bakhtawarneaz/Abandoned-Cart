const abandonedCartQueue = require('../queues/abandonedCart.queue');

// Run every 10 minutes
abandonedCartQueue.add(
  {},
  {
    repeat: { every: 20 * 1000 }, // 10 min
    removeOnComplete: true,
    removeOnFail: false,
  }
);

console.log('🕒 Abandoned cart auto-resend job scheduled every 10 minutes');
