const AbandonedCart = require('../models/abandonedCart.model');
const WhatsappTemplate = require('../models/whatsappTemplate.model');
const { sendWhatsAppMessage } = require('../utils/whatsappSender');
const axios = require('axios');

// exports.processAbandonedCartJob = async (job) => {
//   try {
//     console.log('🔁 Running abandoned cart resend job...');

//     const carts = await AbandonedCart.findAll({
//       where: { sent_status: false, recovered: false },
//     });

//     for (const cart of carts) {
//       const template = await WhatsappTemplate.findOne({ where: { store_id: cart.store_id } });
//       if (!template) continue;

//       const result = await sendWhatsAppMessage(
//         {
//           id: cart.shopify_checkout_id,
//           phone: cart.customer_phone,
//           customer: { first_name: cart.customer_name },
//           line_items: cart.cart_data,
//           abandoned_checkout_url: cart.abandoned_checkout_url,
//           cart_id: cart.id,
//         },
//         template
//       );

//       if (result.success) {
//         await cart.update({ sent_status: true });
//         console.log(`✅ Reminder sent to ${cart.customer_phone}`);
//       }
//     }

//     return { success: true };
//   } catch (error) {
//     console.error('❌ Error in abandonedCart.worker:', error.message);
//     throw error;
//   }
// };


// exports.processAbandonedCartJob = async (job) => {
//   try {
//     console.log('🔁 Running abandoned cart resend job...');

//     // ✅ Fetch all carts that were sent before and not recovered
//     const carts = await AbandonedCart.findAll({
//       where: { sent_status: true, recovered: false },
//     });

//     for (const cart of carts) {
//       // ✅ Check if checkout still exists on Shopify
//       const checkoutStillExists = await verifyCheckoutExists(cart.shopify_checkout_id);
//       if (!checkoutStillExists) {
//         console.log(`🛒 Cart ${cart.shopify_checkout_id} removed/completed — stopping reminders.`);
//         await cart.update({ recovered: true }); // mark recovered to stop future sends
//         continue;
//       }

//       // ✅ Fetch WhatsApp Template
//       const template = await WhatsappTemplate.findOne({ where: { store_id: cart.store_id } });
//       if (!template) continue;

//       // ✅ Send message again
//       const result = await sendWhatsAppMessage(
//         {
//           id: cart.shopify_checkout_id,
//           phone: cart.customer_phone,
//           customer: { first_name: cart.customer_name },
//           line_items: cart.cart_data,
//           abandoned_checkout_url: cart.abandoned_checkout_url,
//           cart_id: cart.id,
//         },
//         template
//       );

//       if (result.success) {
//         console.log(`✅ Reminder re-sent to ${cart.customer_phone}`);
//       }
//     }

//     return { success: true };
//   } catch (error) {
//     console.error('❌ Error in abandonedCart.worker:', error.message);
//     throw error;
//   }
// };

// exports.processAbandonedCartJob = async (job) => {
//   try {
//     console.log("🔁 Running abandoned cart resend job...");

//     const carts = await AbandonedCart.findAll({
//       where: { sent_status: true, recovered: false },
//     });

//     for (const cart of carts) {
//       const stillActive = await verifyCheckoutExists(cart.shopify_checkout_id);

//       if (!stillActive) {
//         console.log(`🛒 Cart ${cart.shopify_checkout_id} removed or empty — stopping reminders.`);
//         await cart.update({ recovered: true });
//         continue;
//       }

//       const template = await WhatsappTemplate.findOne({ where: { store_id: cart.store_id } });
//       if (!template) continue;

//       const result = await sendWhatsAppMessage(
//         {
//           id: cart.shopify_checkout_id,
//           phone: cart.customer_phone,
//           customer: { first_name: cart.customer_name },
//           line_items: cart.cart_data,
//           abandoned_checkout_url: cart.abandoned_checkout_url,
//           cart_id: cart.id,
//         },
//         template
//       );

//       if (result.success) {
//         console.log(`✅ Reminder re-sent to ${cart.customer_phone}`);
//         let remaining = 300;
//         const countdown = setInterval(() => {
//           const min = Math.floor(remaining / 60);
//           const sec = remaining % 60;
//           process.stdout.write(`\r🕒 Next reminder in: ${min}:${sec < 10 ? "0" + sec : sec} `);

//           remaining--;

//           if (remaining < 0) {
//             clearInterval(countdown);
//             console.log("\n⏳ 5 minutes complete — checking cart again...");
//           }
//         }, 1000);
//       }
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("❌ Error in abandonedCart.worker:", error.message);
//     throw error;
//   }
// };

// // ✅ Storefront API verification
// async function verifyCheckoutExists(checkoutId) {
//   try {
//     const response = await axios.post(
//       `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2025-01/graphql.json`,
//       {
//         query: `
//           query getCheckout($id: ID!) {
//             checkout(id: $id) {
//               id
//               completedAt
//               lineItems(first: 1) {
//                 edges {
//                   node {
//                     title
//                   }
//                 }
//               }
//             }
//           }
//         `,
//         variables: {
//           id: `gid://shopify/Checkout/${checkoutId}`,
//         },
//       },
//       {
//         headers: {
//           "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const checkout = response.data?.data?.checkout;

//     if (!checkout) {
//       console.log("⚠️ Checkout not found — may have refreshed internally. Checking for newer checkout...");
    
//       const latestCart = await AbandonedCart.findOne({
//         where: { customer_phone: cart.customer_phone },
//         order: [["updatedAt", "DESC"]],
//       });
    
//       if (latestCart && latestCart.shopify_checkout_id !== checkoutId) {
//         console.log(`🔁 Found refreshed checkout ID: ${latestCart.shopify_checkout_id}. Skipping removal.`);
//         return true; // still active, skip marking recovered
//       }
    
//       return false;
//     }

//     // If checkout is empty or completed
//     if (checkout.completedAt || checkout.lineItems.edges.length === 0) {
//       console.log("🛒 Checkout empty or completed — stopping reminders.");
//       return false;
//     }

//     return true;
//   } catch (err) {
//     console.log("⚠️ Storefront API verify error:", err.response?.data || err.message);
//     return false;
//   }
// }


exports.processAbandonedCartJob = async () => {
  try {
    console.log("🔁 Running abandoned cart resend job...");

    const carts = await AbandonedCart.findAll({
      where: { sent_status: true, recovered: false },
    });

    for (const cart of carts) {
      const stillActive = await verifyCheckoutExists(cart);

      // if (!stillActive) {
      //   console.log(`🛒 Cart ${cart.shopify_checkout_id} not active — marking recovered.`);
      //   await cart.update({ recovered: true });
      //   continue;
      // }

      if (!stillActive) {
        console.log(`🛒 Cart ${cart.shopify_checkout_id} not active — checking for newer one...`);
        const latest = await AbandonedCart.findOne({
          where: { customer_phone: cart.customer_phone },
          order: [["updatedAt", "DESC"]],
        });
      
        if (latest && latest.id !== cart.id && !latest.recovered) {
          console.log(`🔁 Found newer checkout (ID: ${latest.shopify_checkout_id}) — skipping old one.`);
          await cart.update({ recovered: true });
          continue;
        } else {
          console.log(`🛒 No newer checkout — marking as recovered.`);
          await cart.update({ recovered: true });
          continue;
        }
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

        // 🕒 5-minute countdown timer
        let remaining = 300;
        const countdown = setInterval(() => {
          const min = Math.floor(remaining / 60);
          const sec = remaining % 60;
          process.stdout.write(`\r🕒 Next reminder in: ${min}:${sec < 10 ? "0" + sec : sec}`);
          remaining--;
          if (remaining < 0) {
            clearInterval(countdown);
            console.log("\n⏳ 5 minutes complete — checking cart again...");
          }
        }, 1000);
      }
    }
  } catch (err) {
    console.error("❌ Error in abandonedCart.worker:", err.message);
  }
};

// -----------------------------------------------------------------------------
// ✅ Verify checkout via Storefront API (handles refresh case too)
// -----------------------------------------------------------------------------
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

    // 🔄 Fallback: try latest checkout for same phone
    if (!checkout) {
      console.log("⚠️ Checkout not found — may have refreshed internally. Checking for newer checkout...");
      const latest = await AbandonedCart.findOne({
        where: { customer_phone: cart.customer_phone },
        order: [["updatedAt", "DESC"]],
      });
      if (latest && latest.shopify_checkout_id !== checkoutId) {
        console.log(`🔁 Found refreshed checkout ID: ${latest.shopify_checkout_id}. Keeping reminders active.`);
        return true;
      }
      return false;
    }

    if (checkout.completedAt || checkout.lineItems.edges.length === 0) {
      console.log("🛒 Checkout empty or completed — stopping reminders.");
      return false;
    }

    return true;
  } catch (err) {
    console.log("⚠️ Storefront API verify error:", err.response?.data || err.message);
    return false;
  }
}