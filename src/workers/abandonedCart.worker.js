const AbandonedCart = require('../models/abandonedCart.model');
const Store = require('../models/store.model');
const WhatsappTemplate = require('../models/whatsappTemplate.model');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');
const axios = require('axios');



exports.processAbandonedCartJob = async () => {
  try {
    console.log("🔁 Running abandoned cart resend job...");

    const carts = await AbandonedCart.findAll({
      where: { recovered: false }
    });

    for (const cart of carts) {
      const store = await Store.findOne({ where: { id: cart.store_id, status: true } });
      if (!store) continue;

      const stillActive = await verifyCheckoutExists(cart, store);
      if (!stillActive) {
        await cart.update({ recovered: true });
        continue;
      }

      const template = await WhatsappTemplate.findOne({ where: { store_id: store.id } });
      if (!template) continue;

      const now = Date.now();

      // FIRST MESSAGE ALREADY SENT → check 2nd message wait time
      if (cart.sent_status && !cart.second_sent_at) {
        const firstMessageTime = new Date(cart.first_sent_at).getTime();
        const waitTime = store.second_message_delay * 1000;

        if (now - firstMessageTime >= waitTime) {

          console.log(`📤 Sending 2nd message to ${cart.customer_phone}`);

          const result = await sendWhatsAppMessage(
            {
              id: cart.shopify_checkout_id,
              phone: cart.customer_phone,
              customer: { first_name: cart.customer_name },
              line_items: cart.cart_data,
              abandoned_checkout_url: cart.abandoned_checkout_url,
              cart_id: cart.id,
            },
            template
          );

          if (result.success) {
            await cart.update({ second_sent_at: new Date() });
            console.log(`✅ 2nd message sent to ${cart.customer_phone}`);
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Error in abandonedCart.worker:", err.message);
  }
};

// ✅ Verify via Storefront API
async function verifyCheckoutExists(cart, store) {
  try {
    const checkoutId = cart.shopify_checkout_id;

    const response = await axios.post(
      `https://${store.store_url}/api/2025-01/graphql.json`,
      {
        query: `
          query getCheckout($id: ID!) {
            checkout(id: $id) {
              id
              completedAt
              lineItems(first: 1) {
                edges {
                  node { title }
                }
              }
            }
          }
        `,
        variables: { id: `gid://shopify/Checkout/${checkoutId}` },
      },
      {
        headers: {
          "X-Shopify-Storefront-Access-Token": store.store_front_access_token,
          "Content-Type": "application/json",
        },
      }
    );

    const checkout = response.data?.data?.checkout;

    if (!checkout) return false;
    if (checkout.completedAt || checkout.lineItems.edges.length === 0) return false;

    return true;
  } catch (err) {
    console.log("⚠️ verifyCheckoutExists error:", err.response?.data || err.message);
    return false;
  }
}
