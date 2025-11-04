const controller = require('../controllers/abandonedCart.controller');

async function routes(fastify) {
  fastify.post('/webhook/checkout-update', controller.handleWebhook);
}

module.exports = routes;
