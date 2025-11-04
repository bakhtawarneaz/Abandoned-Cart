const templateService = require('../services/whatsappTemplate.service');
const { success, error } = require('../utils/responseHandler');

exports.create = async (req, reply) => {
  try {
    const data = await templateService.createTemplate(req.body);
    return success(reply, 'Template created successfully', data);
  } catch (err) {
    return error(reply, err.message, 400);
  }
};

exports.update = async (req, reply) => {
  try {
    const { id } = req.body;
    const data = await templateService.updateTemplate(id, req.body);
    return success(reply, 'Template updated successfully', data);
  } catch (err) {
    return error(reply, err.message, 400);
  }
};

exports.getAll = async (req, reply) => {
  try {
    const data = await templateService.getAllTemplates();
    return success(reply, 'Templates fetched successfully', data);
  } catch (err) {
    return error(reply, err.message, 400);
  }
};

exports.delete = async (req, reply) => {
  try {
    const { id } = req.params;
    await templateService.deleteTemplate(id);
    return success(reply, 'Template deleted successfully');
  } catch (err) {
    return error(reply, err.message, 400);
  }
};
