const axios = require("axios");
const WhatsappLog = require("../models/whatsappLog.model");

exports.sendWhatsAppMessageStore2 = async (order, template) => {
  try {
    //const customerName = order?.customer_name || "Customer";
    const customerName =
    `${order?.billing_address?.first_name || order?.customer?.first_name || ""} ${
      order?.billing_address?.last_name || order?.customer?.last_name || ""
    }`.trim();
    const checkoutUrl = order?.abandoned_checkout_url || "";
    //const customerPhone = (order?.customer_phone || "").replace(/\+/g, "");

    const customerPhone =
    (order?.billing_address?.phone ||
      order?.shipping_address?.phone ||
      order?.phone ||
      order?.customer?.phone ||
      "").replace(/\+/g, "").trim();

    if (!customerPhone) {
      console.log("⚠ No phone for store 2");
      return { success: false };
    }

    const payload = {
      clientId: template.client_id,
      template_message_id: template.template_message_id,
      numbers: customerPhone,
      template_params: {
        body: {
          type: "BODY",
          text: template.body_text,
          parameters: [
            {
              paramName: "customer_name",
              sampleValue: "Faheem Khan",
              value: customerName,
            },
            {
              paramName: "checkout_link",
              sampleValue: "www.zbzf.com",
              value: checkoutUrl,
            },
          ],
        },
      },
    };

    console.log("📤 STORE 2 PAYLOAD >>>", payload);

    const response = await axios.post(
      "https://waba-be-whatsapp.golive.com.pk/v1/template/message",
      payload,
      {
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "xt-user-token": template.wt_api,
        },
      }
    );

    await WhatsappLog.create({
      store_id: template.store_id,
      cart_id: order.cart_id,
      customer_name: customerName,
      customer_phone: customerPhone,
      response_status: "SENT",
      whatsapp_response: response.data,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Store 2 WhatsApp Error:", error.response?.data || error.message);

    await WhatsappLog.create({
      store_id: template.store_id,
      cart_id: order.cart_id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      response_status: "FAILED",
      whatsapp_response: error.response?.data || error.message,
    });

    return { success: false };
  }
};
