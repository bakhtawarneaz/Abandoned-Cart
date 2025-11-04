const sequelize = require('../config/db');

// Import all models
const Store = require('./store.model');
const WhatsappTemplate = require('./whatsappTemplate.model');
const AbandonedCart = require('./abandonedCart.model');
const WhatsappLog = require('./whatsappLog.model');

module.exports = {
  sequelize,
  Store,
  WhatsappTemplate,
  AbandonedCart,
  WhatsappLog
};
