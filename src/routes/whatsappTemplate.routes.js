const controller = require('../controllers/whatsappTemplate.controller');

async function routes(fastify) {
  fastify.post('/template/create', controller.create);
  fastify.post('/template/update', controller.update);
  fastify.get('/template/list', controller.getAll);
  fastify.delete('/template/:id', controller.delete);
}

module.exports = routes;
