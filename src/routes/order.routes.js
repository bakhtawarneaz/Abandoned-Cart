const controller = require('../controllers/order.controller');

async function orderRoutes(fastify) {
  fastify.post('/webhook/order-create', controller.handleOrderCreate);
}

module.exports = orderRoutes;