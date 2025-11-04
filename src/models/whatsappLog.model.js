const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WhatsappLog = sequelize.define('WhatsappLog', {
  store_id: { type: DataTypes.INTEGER, allowNull: false },
  cart_id: { type: DataTypes.INTEGER, allowNull: false },
  order_id: { type: DataTypes.STRING },           // 🆕 Added
  customer_name: { type: DataTypes.STRING },
  customer_email: { type: DataTypes.STRING },
  customer_phone: { type: DataTypes.STRING },
  message_text: { type: DataTypes.TEXT },
  response_status: { type: DataTypes.STRING },
  response_id: { type: DataTypes.STRING },
  sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = WhatsappLog;
