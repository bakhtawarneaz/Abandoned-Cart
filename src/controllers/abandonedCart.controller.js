const service = require('../services/abandonedCart.service');
const { success, error } = require('../utils/responseHandler');

exports.handleWebhook = async (req, reply) => {
  try {
    const data = await service.handleCheckoutCreate(req.body);
    return success(reply, 'Abandoned cart processed successfully', data);
  } catch (err) {
    return error(reply, err.message, 400);
  }
};
