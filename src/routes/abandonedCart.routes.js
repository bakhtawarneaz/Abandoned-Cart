const controller = require('../controllers/abandonedCart.controller');

async function routes(fastify) {
  fastify.post('/webhook/checkout-create', controller.handleWebhook);
}

module.exports = routes;
