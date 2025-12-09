const axios = require("axios");
const WhatsappLog = require("../models/whatsappLog.model");

exports.sendWhatsAppMessageStore1 = async (order, template) => {
  const customerName =
    `${order?.billing_address?.first_name || order?.customer?.first_name || ""} ${
      order?.billing_address?.last_name || order?.customer?.last_name || ""
    }`.trim();

  const customerPhone =
    (order?.billing_address?.phone ||
      order?.shipping_address?.phone ||
      order?.phone ||
      order?.customer?.phone ||
      "").replace(/\+/g, "").trim();

  if (!customerPhone) {
    console.log("⚠ No customer phone for store 1");
    return { success: false };
  }

  try {
    const parameters =
      (template.body_text_parameters || []).map((param) => {
        let value = "";

        switch (param.sampleValue) {
          case "customer_name":
            value = customerName;
            break;
          case "products":
            value = (order?.line_items || [])
              .map((i) => i.title)
              .join(", ");
            break;
          case "checkout_url":
            value = order.abandoned_checkout_url || "";
            break;
          default:
            value = param.value || "";
        }

        return {
          paramName: param.paramName,
          sampleValue: param.sampleValue,
          value,
        };
      });

    const payload = {
      clientId: template.client_id,
      template_message_id: template.template_message_id,
      numbers: customerPhone,
      template_params: {
        ...(template.header_value && {
          header: {
            type: "HEADER",
            format: template.header_format || "IMAGE",
            value: template.header_value,
            sampleValue: template.header_sample_value,
          },
        }),

        body: {
          type: "BODY",
          text: template.body_text,
          parameters,
        },
      },
    };

    const response = await axios.post(
      "https://waba-be-whatsapp.its.com.pk/v1/template/message",
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
      order_id: order?.id || order?.order_id || null,
      customer_name: customerName,
      customer_phone: customerPhone,
      response_status: "SENT",
      whatsapp_response: response.data,
    });

    return { success: true };
  } catch (error) {
    console.error("❌ Store 1 send error:", error.response?.data || error.message);

    await WhatsappLog.create({
      store_id: template.store_id,
      cart_id: order.cart_id,
      order_id: order?.id || order?.order_id || null,
      customer_name: customerName,
      customer_phone: customerPhone,
      response_status: "FAILED",
      whatsapp_response: error.response?.data || error.message,
    });

    return { success: false };
  }
};
