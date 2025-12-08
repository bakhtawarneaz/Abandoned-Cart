const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Store = sequelize.define('Store', {
  store_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  store_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  store_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  access_token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  store_front_access_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  first_message_delay: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  second_message_delay: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
});

module.exports = Store;
