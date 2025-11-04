const AbandonedCart = require('../models/abandonedCart.model');
const Store = require('../models/store.model');
const WhatsappTemplate = require('../models/whatsappTemplate.model');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');

// exports.handleCheckoutCreate = async (checkoutData) => {
//   try {
//     const { id, phone, customer, line_items, abandoned_checkout_url, email } = checkoutData;
//   console.log("🧾 Webhook payload received");
//     // ✅ 1. Find active store
//     const store = await Store.findOne({ where: { status: true } });
//     if (!store) throw new Error('No active store found');

//     // ✅ 2. Save abandoned cart record
//     const cart = await AbandonedCart.create({
//       shopify_checkout_id: id,
//       store_id: store.id,
//       customer_name: customer?.first_name || 'Guest',
//       customer_phone: phone || null,
//       customer_email: email || customer?.email || null,
//       cart_data: line_items || [],
//       abandoned_checkout_url
//     });

//     // ✅ 3. Fetch WhatsApp Template
//     const template = await WhatsappTemplate.findOne({
//       where: { store_id: store.id },
//     });
//     if (!template) throw new Error('No WhatsApp template found for store');

//     // ✅ 4. Send WhatsApp Message
//     if (phone) {
//       const result = await sendWhatsAppMessage(
//         { ...checkoutData, cart_id: cart.id },
//         template
//       );

//       if (result.success) {
//         await cart.update({ sent_status: true });
//         console.log(`✅ Message sent for cart ID: ${cart.id}`);
//       } else {
//         console.warn(`⚠️ WhatsApp send failed for cart ID: ${cart.id}`);
//       }
//     } else {
//       console.log(`⚠️ Skipping WhatsApp send — no phone number found.`);
//     }

//     return cart;
//   } catch (err) {
//     console.error('❌ Error in handleCheckoutCreate:', err.message);
//     throw new Error(err.message);
//   }
// };

exports.handleCheckoutCreate = async (checkoutData) => {
  try {
    console.log('🧾 Webhook payload received');

    if (
      !checkoutData.phone &&
      !checkoutData.shipping_address?.phone &&
      !checkoutData.customer?.phone
    ) {
      console.log("⏳ Skipping — checkout incomplete (no phone yet)");
      return;
    }
    
    // ✅ Extract all possible phone fields
    const customerPhone =
      checkoutData?.customer?.phone ||
      checkoutData?.shipping_address?.phone ||
      checkoutData?.shipping_lines?.[0]?.phone ||
      checkoutData?.customer?.default_address?.phone ||
      checkoutData?.phone ||
      null;

    console.log('📱 Extracted phone:', customerPhone);

    const {
      id,
      customer,
      line_items,
      abandoned_checkout_url,
      email,
    } = checkoutData;

    // ✅ 1. Find active store
    const store = await Store.findOne({ where: { status: true } });
    if (!store) throw new Error('No active store found');

    // ✅ 2. Prevent duplicate entry (optional but recommended)
    const existing = await AbandonedCart.findOne({
      where: { shopify_checkout_id: String(id) },
    });
    if (existing) {
      console.log(`⚠️ Checkout ID ${id} already exists, skipping duplicate save.`);
      return existing;
    }

    // ✅ 3. Save abandoned cart record
    const cart = await AbandonedCart.create({
      shopify_checkout_id: id,
      store_id: store.id,
      customer_name: customer?.first_name || 'Guest',
      customer_phone: customerPhone,
      customer_email: email || customer?.email || null,
      cart_data: line_items || [],
      abandoned_checkout_url,
    });

    // ✅ 4. Fetch WhatsApp Template
    const template = await WhatsappTemplate.findOne({
      where: { store_id: store.id },
    });
    if (!template) throw new Error('No WhatsApp template found for store');

    // ✅ 5. Send WhatsApp Message if phone found
    if (customerPhone) {
      console.log(`🚀 Sending WhatsApp message to ${customerPhone}...`);

      const result = await sendWhatsAppMessage(
        { ...checkoutData, cart_id: cart.id },
        template
      );

      if (result.success) {
        await cart.update({ sent_status: true });
        console.log(`✅ Message sent successfully for cart ID: ${cart.id}`);
      } else {
        console.warn(`⚠️ WhatsApp send failed for cart ID: ${cart.id}`);
      }
    } else {
      console.log(`⚠️ Skipping WhatsApp send — no phone number found.`);
    }

    return cart;
  } catch (err) {
    console.error('❌ Error in handleCheckoutCreate:', err.message);
    throw new Error(err.message);
  }
};