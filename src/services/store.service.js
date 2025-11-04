const Store = require('../models/store.model');

exports.createStore = async (data) => {
  const existing = await Store.findOne({ where: { store_id: data.store_id } });
  if (existing) throw new Error('Store already exists with this Shopify ID');
  return await Store.create(data);
};

exports.updateStore = async (id, data) => {
  const store = await Store.findByPk(id);
  if (!store) throw new Error('Store not found');
  await store.update(data);
  return store;
};

exports.getStores = async () => {
  return await Store.findAll({ order: [['id', 'DESC']] });
};

exports.changeStatus = async (id, status) => {
  const store = await Store.findByPk(id);
  if (!store) throw new Error('Store not found');
  store.status = status;
  await store.save();
  return store;
};

exports.deleteStore = async (id) => {
  const store = await Store.findByPk(id);
  if (!store) throw new Error('Store not found');
  await store.destroy();
  return true;
};
