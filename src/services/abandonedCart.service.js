const axios = require("axios");
const AbandonedCart = require('../models/abandonedCart.model');
const Store = require('../models/store.model');
const WhatsappTemplate = require('../models/whatsappTemplate.model');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


exports.handleCheckoutCreate = async (req) => {
  try {
    const checkoutData = req.body;

    console.log("🧾 Webhook received for checkout create");

    if (checkoutData?.order_id || checkoutData?.completed_at) {
      console.log("✅ Checkout already converted to order — skipping abandoned cart");
      return;
    }

    // ---- GET SHOP DOMAIN FROM WEBHOOK ----
    const shopDomain = req.headers['x-shopify-shop-domain'];
    const cleanShopDomain = shopDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
    console.log("🔍 Store request from:", cleanShopDomain);

    // ---- FIND STORE ----
    const store = await Store.findOne({
      where: { store_url: cleanShopDomain }
    });

    if (!store) {
      console.log("❌ No matching store found for", cleanShopDomain);
      return;
    }

    // ---- PHONE CHECK ----
    if (!checkoutData.phone &&
        !checkoutData.shipping_address?.phone &&
        !checkoutData.customer?.phone) {
      console.log("⏳ Skipping — no phone found yet");
      return;
    }

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

    const { id, customer, line_items, abandoned_checkout_url, recovery_url, email, token } = checkoutData;

    const checkoutUrl = recovery_url || abandoned_checkout_url;

    if (!checkoutUrl || !checkoutUrl.includes("checkout")) {
      console.log("🚫 Skipping — invalid recovery URL (redirects to homepage)");
      return;
    }

    // ---- VERIFY ORDER ----
    await sleep(15000);

    const cleanUrl = store.store_url.replace(/^https?:\/\//, "");
    const shopifyAdminUrl = `https://${cleanUrl}/admin/api/2025-01/orders.json?checkout_token=${token}`;
    const headers = {
      "X-Shopify-Access-Token": store.access_token,
      "Content-Type": "application/json",
    };

    try {
      const verifyRes = await axios.get(shopifyAdminUrl, { headers });
      if (verifyRes.data.orders?.length > 0) {
        console.log(`✅ Checkout ${id} already converted to order — skipping abandoned cart`);
        return;
      }
    } catch (err) {
      console.warn("⚠️ Could not verify checkout status via Shopify Admin API");
    }

    // ---- CREATE OR UPDATE ABANDONED CART ----
    const existingCart = await AbandonedCart.findOne({ where: { customer_phone: customerPhone } });

    if (existingCart) {
      await existingCart.update({
        shopify_checkout_id: String(id),
        cart_data: line_items || [],
        abandoned_checkout_url: checkoutUrl,
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
        abandoned_checkout_url: checkoutUrl,
        sent_status: false,
        recovered: false,
      });
      console.log(`🆕 New abandoned cart created for ${customerPhone}`);
    }

    // ---- SEND MESSAGE AFTER DELAY ----
    const template = await WhatsappTemplate.findOne({ where: { store_id: store.id } });
    if (!template) throw new Error("No WhatsApp template found");

    const delay = store.first_message_delay * 1000;

    setTimeout(async () => {
      try {
        const recheck = await axios.get(shopifyAdminUrl, { headers });
        if (recheck.data.orders?.length > 0) {
          console.log(`⏹️ Recheck: order created after delay for checkout ${id}, skipping message`);
          return;
        }
      } catch {}

      const freshCart = await AbandonedCart.findOne({ where: { customer_phone: customerPhone } });
      if (!freshCart || freshCart.sent_status) return;

      console.log("📤 Sending WhatsApp message for abandoned checkout...");

      const result = await sendWhatsAppMessage(
        {
          ...checkoutData,
          cart_id: freshCart.id,
          abandoned_checkout_url: checkoutUrl,
        },
        template
      );

      if (result.success) {
        await freshCart.update({ sent_status: true, first_sent_at: new Date() });
        console.log(`✅ First message sent for cart ID: ${freshCart.id}`);
      }
    }, delay);

  } catch (err) {
    console.error("❌ Error in handleCheckoutCreate:", err);
  }
};



