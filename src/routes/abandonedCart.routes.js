const controller = require('../controllers/abandonedCart.controller');

async function routes(fastify) {
  fastify.post('/webhook/checkout-create', controller.handleCheckoutCreate);
  fastify.post('/webhook/checkout-update', controller.handleCheckoutUpdate);
}

module.exports = routes;
