const service = require('../services/order.service');
const { success, error } = require('../utils/responseHandler');

exports.handleOrderCreate = async (req, reply) => {
  try {
    const data = await service.handleOrderCreate(req.body);
    return success(reply, 'Order webhook processed successfully', data);
  } catch (err) {
    return error(reply, err.message, 400);
  }
};
