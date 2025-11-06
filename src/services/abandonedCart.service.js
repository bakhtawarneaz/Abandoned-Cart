const AbandonedCart = require('../models/abandonedCart.model');
const Store = require('../models/store.model');
const WhatsappTemplate = require('../models/whatsappTemplate.model');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');


// exports.handleCheckoutCreate = async (checkoutData) => {
//   try {
//     console.log("🧾 Webhook received for checkout create");

//     if (
//       !checkoutData.phone &&
//       !checkoutData.shipping_address?.phone &&
//       !checkoutData.customer?.phone
//     ) {
//       console.log("⏳ Skipping — checkout incomplete (no phone yet)");
//       return;
//     }

//     const customerPhone =
//       checkoutData?.customer?.phone ||
//       checkoutData?.shipping_address?.phone ||
//       checkoutData?.phone ||
//       null;

//     console.log("📱 Extracted phone:", customerPhone);

//     const { id, customer, line_items, abandoned_checkout_url, email } = checkoutData;

//     const store = await Store.findOne({ where: { status: true } });
//     if (!store) throw new Error("No active store found");

//     // 🧩 upsert by phone (keep one active checkout per customer)
//     // const [cart] = await AbandonedCart.upsert(
//     //   {
//     //     shopify_checkout_id: String(id),
//     //     store_id: store.id,
//     //     customer_name: customer?.first_name || "Guest",
//     //     customer_phone: customerPhone,
//     //     customer_email: email || customer?.email || null,
//     //     cart_data: line_items || [],
//     //     abandoned_checkout_url,
//     //     sent_status: false,
//     //     recovered: false,
//     //   },
//     //   {
//     //     conflictFields: ["customer_phone"],
//     //     returning: true,
//     //   }
//     // );

    

//     console.log(`🆕/🔁 Cart recorded for ${customerPhone}`);

//     const template = await WhatsappTemplate.findOne({
//       where: { store_id: store.id },
//     });
//     if (!template) throw new Error("No WhatsApp template found for store");

//     // 🧩 first message after 20 sec
//     setTimeout(async () => {
//       const freshCart = await AbandonedCart.findOne({
//         where: { customer_phone: customerPhone, recovered: false },
//       });
//       if (!freshCart) return;

//       const result = await sendWhatsAppMessage(
//         { ...checkoutData, cart_id: freshCart.id },
//         template
//       );

//       if (result.success) {
//         await freshCart.update({ sent_status: true });
//         console.log(`✅ First message sent successfully for cart ID: ${freshCart.id}`);
//       }
//     }, 20 * 1000);
//   } catch (err) {
//     console.error("❌ Error in handleCheckoutCreate:", err.message);
//   }
// };


exports.handleCheckoutCreate = async (checkoutData) => {
  try {
    console.log("🧾 Webhook received for checkout create");

    if (!checkoutData.phone && !checkoutData.shipping_address?.phone && !checkoutData.customer?.phone) {
      console.log("⏳ Skipping — no phone found yet");
      return;
    }

    // const customerPhone =
    //   checkoutData?.customer?.phone ||
    //   checkoutData?.shipping_address?.phone ||
    //   checkoutData?.phone ||
    //   null;

    const customerPhone =
      checkoutData?.billing_address?.phone ||
      checkoutData?.shipping_address?.phone ||
      checkoutData?.customer?.phone ||
      checkoutData?.phone ||
      null;

    if (!customerPhone) {
      console.log("⚠️ No valid phone number found in checkout, skipping...");
      return;
    }

    const { id, customer, line_items, abandoned_checkout_url, email } = checkoutData;

    const store = await Store.findOne({ where: { status: true } });
    if (!store) throw new Error("No active store found");

    const existingCart = await AbandonedCart.findOne({ where: { customer_phone: customerPhone } });

    if (existingCart) {
      await existingCart.update({
        shopify_checkout_id: String(id),
        cart_data: line_items || [],
        abandoned_checkout_url,
        recovered: false,
      });
      console.log(`🔄 Checkout refreshed for ${customerPhone}`);
    } else {
      await AbandonedCart.create({
        shopify_checkout_id: String(id),
        store_id: store.id,
        customer_name: customer?.first_name || "Guest",
        customer_phone: customerPhone,
        customer_email: email || customer?.email || null,
        cart_data: line_items || [],
        abandoned_checkout_url,
        sent_status: false,
        recovered: false,
      });
      console.log(`🆕 New abandoned cart created for ${customerPhone}`);
    }

    const template = await WhatsappTemplate.findOne({ where: { store_id: store.id } });
    if (!template) throw new Error("No WhatsApp template found");

    setTimeout(async () => {
      const freshCart = await AbandonedCart.findOne({ where: { customer_phone: customerPhone } });
      if (!freshCart || freshCart.sent_status) {
        console.log(`⚠️ Skipping — message already sent for cart ID: ${freshCart?.id}`);
        return;
      }

      const result = await sendWhatsAppMessage({ ...checkoutData, cart_id: freshCart.id }, template);

      if (result.success) {
        await freshCart.update({ sent_status: true });
        console.log(`✅ Initial message sent for cart ID: ${freshCart.id}`);
      } else {
        console.warn(`⚠️ Failed to send initial message for cart ID: ${freshCart.id}`);
      }
    }, 20 * 1000);
  } catch (err) {
    console.error("❌ Error in handleCheckoutCreate:", err.message);
  }
};
