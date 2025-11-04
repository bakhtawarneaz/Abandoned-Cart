    const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WhatsappTemplate = sequelize.define('StoreWhatsappTemplates', {
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  client_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  template_message_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  header_value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  header_format: {
    type: DataTypes.STRING,
    allowNull: true
  },
  header_sample_value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  upload_media_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  body_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  body_text_parameters: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  wt_api: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  allow_button: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = WhatsappTemplate;
