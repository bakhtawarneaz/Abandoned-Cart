const storeController = require('../controllers/store.controller');

async function routes(fastify) {
  fastify.post('/store/create', storeController.create);
  fastify.post('/store/update', storeController.update);
  fastify.get('/store/list', storeController.getAll);
  fastify.post('/store/status', storeController.changeStatus);
  fastify.delete('/store/:id', storeController.delete);
}

module.exports = routes;
