const AbandonedCart = require('../models/abandonedCart.model');

exports.handleOrderCreate = async (orderData) => {
  if (!orderData || !orderData.id) {
    throw new Error('Invalid order payload');
  }

  const checkoutId = orderData.checkout_id || orderData.cart_token;
  if (!checkoutId) {
    throw new Error('Missing checkout reference');
  }

  // ✅ Mark as recovered
  const [updated] = await AbandonedCart.update(
    { recovered: true },
    { where: { shopify_checkout_id: checkoutId } }
  );

  if (updated > 0) {
    return { message: 'Cart marked as recovered and reminders stopped' };
  } else {
    return { message: 'No matching abandoned cart found' };
  }
};
