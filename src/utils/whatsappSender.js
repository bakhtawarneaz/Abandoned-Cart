// const axios = require('axios');
// const WhatsappLog = require('../models/whatsappLog.model');




// exports.sendWhatsAppMessage = async (data, StoreWhatsappTemplates) => {
//   // 🔹 Define outside try/catch so catch can access it safely
//   const order = data || {};

//   const customerName = `${order?.billing_address?.first_name || order?.customer?.first_name || ""} ${order?.billing_address?.last_name || order?.customer?.last_name || ""}`.trim();
//   const lineItems = order?.line_items || [];
//   const productNames = lineItems.map(item => item.title).join(", ") || "N/A";

//   const customerPhone =
//     (order?.billing_address?.phone ||
//       order?.shipping_address?.phone ||
//       order?.phone ||
//       order?.customer?.phone ||
//       "").replace(/\+/g, "").trim();

//   console.log("📞 customerPhone:", customerPhone);

//   try {
//     const textParameters = StoreWhatsappTemplates.body_text_parameters || [];

//     const parameters = textParameters.map(param => {
//       let value = "";

//       switch (param.sampleValue) {
//         case "customer_name":
//           value = customerName;
//           break;
//         case "products":
//           value = productNames;
//           break;
//         case "checkout_url":
//           value = order?.abandoned_checkout_url || "";
//           break;
//         default:
//           value = param.value || "";
//           break;
//       }

//       return { paramName: param.paramName, sampleValue: param.sampleValue, value };
//     });

//     const payload = {
//       clientId: StoreWhatsappTemplates.client_id,
//       template_message_id: StoreWhatsappTemplates.template_message_id,
//       numbers: customerPhone,
//       template_params: {
//         ...(StoreWhatsappTemplates.header_value && {
//           header: {
//             type: "HEADER",
//             format: StoreWhatsappTemplates.header_format || "IMAGE",
//             value: StoreWhatsappTemplates.header_value,
//             sampleValue: StoreWhatsappTemplates.header_sample_value || "",
//           },
//         }),

//         body: {
//           type: "BODY",
//           text: StoreWhatsappTemplates.body_text,
//           parameters,
//         },
//       },
//     };

//     if (!customerPhone) {
//       console.log("⚠ No phone number found");
//       return { success: false };
//     }

//     const response = await axios.post(
//       "https://waba-be-whatsapp.its.com.pk/v1/template/message",
//       payload,
//       {
//         headers: {
//           accept: "application/json",
//           "content-type": "application/json",
//           "xt-user-token": StoreWhatsappTemplates.wt_api,
//         },
//       }
//     );

//     console.log("📩 WhatsApp API Response:", response.data);

//     // Save log
//     await WhatsappLog.create({
//       store_id: StoreWhatsappTemplates.store_id,
//       cart_id: order?.cart_id || null,
//       customer_name: customerName,
//       customer_phone: customerPhone,
//       message_text: StoreWhatsappTemplates.body_text,
//       response_status: "SENT",
//       whatsapp_response: response.data,
//     });

//     return { success: true };

//   } catch (error) {
//     console.error("❌ WhatsApp Send Error:", error.response?.data || error.message);

//     // 🔥 FIXED: order & customer values available here
//     await WhatsappLog.create({
//       store_id: StoreWhatsappTemplates.store_id,
//       cart_id: order?.cart_id || null,
//       customer_name: customerName,
//       customer_phone: customerPhone,
//       message_text: StoreWhatsappTemplates.body_text,
//       response_status: "FAILED",
//       whatsapp_response: error.response?.data,
//     });

//     return { success: false, error };
//   }
// };




const { sendWhatsAppMessageStore1 } = require("./whatsappSender.store1");
const { sendWhatsAppMessageStore2 } = require("./whatsappSender.store2");

exports.sendWhatsAppMessage = async (order, template) => {

  // 🚀 IF STORE = 2 → Zuri-by-Zainab special template use hoga
  if (template.store_id === 2) {
    console.log("⚡ Using Store 2 WhatsApp Sender");
    return await sendWhatsAppMessageStore2(order, template);
  }

  // 🚀 Otherwise default sender
  console.log("⚡ Using Store 1 WhatsApp Sender");
  return await sendWhatsAppMessageStore1(order, template);
};
