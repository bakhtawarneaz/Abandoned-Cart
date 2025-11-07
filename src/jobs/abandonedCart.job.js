const abandonedCartQueue = require('../queues/abandonedCart.queue');

// Run every 10 minutes
abandonedCartQueue.add(
  {},
  {
    repeat: { every: 60 * 60 * 1000}, 
    removeOnComplete: true,
    removeOnFail: false,
  }
);

console.log('🕒 Abandoned cart auto-resend job scheduled every 10 minutes');
