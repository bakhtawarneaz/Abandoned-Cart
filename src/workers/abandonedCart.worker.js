const AbandonedCart = require('../models/abandonedCart.model');
const WhatsappTemplate = require('../models/whatsappTemplate.model');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');

exports.processAbandonedCartJob = async (job) => {
  try {
    console.log('🔁 Running abandoned cart resend job...');

    const carts = await AbandonedCart.findAll({
      where: { sent_status: false, recovered: false },
    });

    for (const cart of carts) {
      const template = await WhatsappTemplate.findOne({ where: { store_id: cart.store_id } });
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
        await cart.update({ sent_status: true });
        console.log(`✅ Reminder sent to ${cart.customer_phone}`);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Error in abandonedCart.worker:', error.message);
    throw error;
  }
};
