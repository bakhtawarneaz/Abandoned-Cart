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
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Store;
