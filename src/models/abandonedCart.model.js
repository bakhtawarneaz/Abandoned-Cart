const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AbandonedCart = sequelize.define('AbandonedCart', {
  shopify_checkout_id: { type: DataTypes.STRING },
  store_id: { type: DataTypes.INTEGER },
  customer_name: { type: DataTypes.STRING },
  customer_phone: { type: DataTypes.STRING },
  cart_data: { type: DataTypes.JSONB },
  abandoned_checkout_url: { type: DataTypes.TEXT },
  sent_status: { type: DataTypes.BOOLEAN, defaultValue: false },
  recovered: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = AbandonedCart;
