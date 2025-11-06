const AbandonedCart = require('../models/abandonedCart.model');
const WhatsappTemplate = require('../models/whatsappTemplate.model');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');
const axios = require('axios');

exports.processAbandonedCartJob = async () => {
  try {
    console.log("🔁 Running abandoned cart resend job...");

    const carts = await AbandonedCart.findAll({
      where: { sent_status: true, recovered: false },
    });

    for (const cart of carts) {
      const stillActive = await verifyCheckoutExists(cart);

      if (!stillActive) {
        console.log(`🛒 Cart ${cart.shopify_checkout_id} inactive — marking recovered.`);
        await cart.update({ recovered: true });
        continue;
      }

      const template = await WhatsappTemplate.findOne({
        where: { store_id: cart.store_id },
      });
      if (!template) continue;

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
        console.log(`✅ Reminder re-sent to ${cart.customer_phone}`);
      }

      // 🕒 Show 5-min countdown (for visibility only)
      let remaining = 300;
      const countdown = setInterval(() => {
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        process.stdout.write(`\r🕒 Next reminder check in: ${min}:${sec < 10 ? "0" + sec : sec}`);
        remaining--;
        if (remaining < 0) {
          clearInterval(countdown);
          console.log("\n⏳ 5 minutes complete — next job cycle will re-check carts.");
        }
      }, 1000);
    }
  } catch (err) {
    console.error("❌ Error in abandonedCart.worker:", err.message);
  }
};

// ✅ Verify via Storefront API
async function verifyCheckoutExists(cart) {
  try {
    const checkoutId = cart.shopify_checkout_id;

    const response = await axios.post(
      `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2025-01/graphql.json`,
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
          "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
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
