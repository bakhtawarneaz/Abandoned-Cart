const storeService = require('../services/store.service');
const { success, error } = require('../utils/responseHandler');

exports.create = async (req, reply) => {
  try {
    const data = await storeService.createStore(req.body);
    return success(reply, 'Store created successfully', data);
  } catch (err) {
    return error(reply, err.message, 400);
  }
};

exports.update = async (req, reply) => {
  try {
    const { id } = req.body;
    const data = await storeService.updateStore(id, req.body);
    return success(reply, 'Store updated successfully', data);
  } catch (err) {
    return error(reply, err.message, 400);
  }
};

exports.getAll = async (req, reply) => {
  try {
    const data = await storeService.getStores();
    return success(reply, 'Store list fetched successfully', data);
  } catch (err) {
    return error(reply, err.message, 400);
  }
};

exports.changeStatus = async (req, reply) => {
  try {
    const { id, status } = req.body;
    const data = await storeService.changeStatus(id, status);
    return success(reply, 'Store status updated', data);
  } catch (err) {
    return error(reply, err.message, 400);
  }
};

exports.delete = async (req, reply) => {
  try {
    const { id } = req.params;
    await storeService.deleteStore(id);
    return success(reply, 'Store deleted successfully');
  } catch (err) {
    return error(reply, err.message, 400);
  }
};
