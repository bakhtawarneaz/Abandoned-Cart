const WhatsappTemplate = require('../models/whatsappTemplate.model');

exports.createTemplate = async (data) => {
  return await WhatsappTemplate.create(data);
};

exports.updateTemplate = async (id, data) => {
  const record = await WhatsappTemplate.findByPk(id);
  if (!record) throw new Error('Template not found');
  await record.update(data);
  return record;
};

exports.getAllTemplates = async () => {
  return await WhatsappTemplate.findAll({ order: [['id', 'DESC']] });
};

exports.deleteTemplate = async (id) => {
  const record = await WhatsappTemplate.findByPk(id);
  if (!record) throw new Error('Template not found');
  await record.destroy();
  return true;
};
