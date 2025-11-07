const axios = require('axios');
const WhatsappLog = require('../models/whatsappLog.model');

exports.sendWhatsAppMessage = async (data, StoreWhatsappTemplates) => {
  try {
    const order = data || {};

    // ✅ Extract customer and order details
    const customerName = `${order?.billing_address?.first_name || order?.customer?.first_name || ""} ${order?.billing_address?.last_name || order?.customer?.last_name || ""}`.trim();
    const lineItems = order?.line_items || [];
    const productNames = lineItems.map(item => item.title).join(", ") || "N/A";
    const customerPhone =
          (order?.billing_address?.phone ||
          order?.shipping_address?.phone ||
          order?.phone ||
          order?.customer?.phone ||
          "").replace(/\+/g, "").trim();
    console.log("📞 customerPhone:", customerPhone);
    // ✅ Use template body parameters from DB
    const textParameters = StoreWhatsappTemplates.body_text_parameters || [];

    const parameters = textParameters.map(param => {
      let value = "";
      // switch (param.sampleValue) {
      //   case "customer_name": value = customerName; break;
      //   case "products": value = productNames; break;
      //   default: value = param.value || ""; break;
      // }
      switch (param.sampleValue) {
        case "customer_name":
          value = customerName;
          break;
      
        case "products":
          value = order?.abandoned_checkout_url || "";
          break;
      
        default:
          value = param.value || "";
          break;
      }
      return {
        paramName: param.paramName || null,
        sampleValue: param.sampleValue || "",
        value,
      };
    });

    // ✅ WhatsApp API Payload
    const payload = {
      clientId: StoreWhatsappTemplates.client_id,
      template_message_id: StoreWhatsappTemplates.template_message_id,
      numbers: customerPhone,
      template_params: {
        ...(StoreWhatsappTemplates.header_value
          ? {
              header: {
                type: "HEADER",
                format: StoreWhatsappTemplates.header_format || "IMAGE",
                value: StoreWhatsappTemplates.header_value,
                sampleValue: StoreWhatsappTemplates.header_sample_value || "Not Available",
              },
            }
          : {}),
        body: {
          type: "BODY",
          text: StoreWhatsappTemplates.body_text,
          parameters,
        },
      },
    };
        
    if (!customerPhone) {
      console.log("⚠️ No phone number found for this checkout, skipping WhatsApp send");
      return { success: false, error: "Missing customer phone number" };
    }

    const response = await axios.post(
      "https://waba-be-whatsapp.its.com.pk/v1/template/message",
      payload,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
          origin: "https://waba-whatsapp.its.com.pk",
          referer: "https://waba-whatsapp.its.com.pk",
          "xt-user-token": StoreWhatsappTemplates.wt_api,
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        },
      }
    );

    console.log("📩 WhatsApp API Response:", JSON.stringify(response.data, null, 2));
    
    if (response?.data) {
      console.log(`✅ WhatsApp sent to ${customerPhone}`);
      await WhatsappLog.create({
        store_id: StoreWhatsappTemplates.store_id,
        cart_id: order?.cart_id || null,
        order_id: order?.id || order?.order_id || null,   // 🆕 Added
        customer_name: customerName,
        customer_email: order?.email || order?.customer?.email || null,
        customer_phone: customerPhone,
        message_text: StoreWhatsappTemplates.body_text,
        response_status: 'SENT',
        whatsapp_response: response.data
      });

      return { success: true, response: response.data };
    } else {
      return { success: false, error: "Empty API response" };
    }

  } catch (error) {
    console.error("❌ WhatsApp Send Error:", error.response?.data || error.message);
    await WhatsappLog.create({
      store_id: StoreWhatsappTemplates.store_id,
      cart_id: order?.cart_id || null,
      order_id: order?.id || order?.order_id || null,   // 🆕 Added
      customer_name: customerName,
      customer_email: order?.email || order?.customer?.email || null,
      customer_phone: customerPhone,
      message_text: StoreWhatsappTemplates.body_text,
      response_status: 'FAILED',
      whatsapp_response: error.response?.data
    });

    return { success: false, error: error.response?.data || error.message };
  }
};
