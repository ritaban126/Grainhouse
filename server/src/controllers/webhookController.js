// import Stripe from "stripe"
// import Order from "../models/orderModel.js"
// import Image from "../models/imageModel.js"
// import User from "../models/userModel.js"
// import { sendEmail } from "../utils/email.js"


// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// // ── POST /api/payments/webhook ────────────────────────────────────────────────
// // express.raw() is applied in server.js before this route
// const webhookHandler = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;
 
//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     console.error("Webhook signature error:", err.message);
//     return res.status(400).json({ error: `Webhook Error: ${err.message}` });
//   }
 
//   switch (event.type) {
 
//     // ── Payment succeeded ───────────────────────────────────────────────────
//     case "checkout.session.completed": {
//       const session = event.data.object;
//       const { orderId, userId, type, credits } = session.metadata;
 
//       // ── Credit purchase ─────────────────────────────────────────────────
//       if (type === "credits") {
//         await User.findByIdAndUpdate(userId, {
//           $inc: { credits: Number(credits) },
//         });
//         console.log(`✅  Credits added: ${credits} → user ${userId}`);
//         break;
//       }
 
//       // ── Image purchase ──────────────────────────────────────────────────
//       const order = await Order.findById(orderId).populate("items.image");
//       if (!order) { console.error("Order not found:", orderId); break; }
 
//       order.status          = "paid";
//       order.paidAt          = new Date();
//       order.stripePaymentId = session.payment_intent;
//       await order.save();
 
//       // Update contributor earnings + image stats
//       for (const item of order.items) {
//         await User.findByIdAndUpdate(item.contributor, {
//           $inc: {
//             "contributorProfile.totalEarnings": item.contributorEarning,
//             "contributorProfile.pendingPayout": item.contributorEarning,
//           },
//         });
//         await Image.findByIdAndUpdate(item.image._id, {
//           $inc: { totalDownloads: 1, totalRevenue: item.priceAtSale },
//         });
//       }
 
//       // Send receipt email
//       const buyer = await User.findById(userId);
//       const itemsList = order.items
//         .map(i => `<li>${i.image.title} — ${i.licenseType} license</li>`)
//         .join("");
 
//       await sendEmail({
//         to:      buyer.email,
//         subject: `NichePix Receipt — ${order.invoiceNumber}`,
//         html: `
//           <h2>Thanks for your purchase, ${buyer.name}!</h2>
//           <p>Invoice: <strong>${order.invoiceNumber}</strong></p>
//           <ul>${itemsList}</ul>
//           <p>Total: ₹${(order.totalAmount / 100).toFixed(2)}</p>
//           <p><a href="${process.env.CLIENT_URL}/dashboard/purchases">Download your images →</a></p>
//         `,
//       });
 
//       console.log(`✅  Order paid: ${order.invoiceNumber}`);
//       break;
//     }
 
//     // ── Payment failed ──────────────────────────────────────────────────────
//     case "payment_intent.payment_failed": {
//       const paymentIntent = event.data.object;
//       await Order.findOneAndUpdate(
//         { stripeSessionId: paymentIntent.id },
//         { status: "failed" }
//       );
//       break;
//     }
 
//     default:
//       console.log(`Unhandled event: ${event.type}`);
//   }
 
//   res.json({ received: true });
// };

// export default webhookHandler;



import Stripe from "stripe";
import Order from "../models/orderModel.js";
import Image from "../models/imageModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/email.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// helper: idempotency check (prevents double processing)
const isAlreadyProcessed = (order) => {
  return order.status === "paid";
};

const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).json({ error: err.message });
  }

  switch (event.type) {

    // ─────────────────────────────────────────────
    // 1. SUCCESSFUL CHECKOUT
    // ─────────────────────────────────────────────
  case "checkout.session.completed": {
  const session = event.data.object;
  const metadata = session.metadata || {};

  const { type, orderId, userId, credits } = metadata;

  try {
    // ───────────────────────────────
    // CREDIT PURCHASE FLOW
    // ───────────────────────────────
    if (type === "credits") {
      if (!userId || !credits) break;

      await User.findByIdAndUpdate(userId, {
        $inc: { credits: Number(credits) },
      });

      console.log(`✅ Credits added: ${credits} → ${userId}`);
      break;
    }

    // ───────────────────────────────
    // ORDER PURCHASE FLOW
    // ───────────────────────────────
    if (type === "order") {
      if (!orderId) break;

      const order = await Order.findById(orderId).populate("items.image");

      if (!order) {
        console.error("❌ Order not found:", orderId);
        break;
      }

      // ─── IDENTITY: prevent double processing ───
      if (order.status === "paid") {
        console.log("⚠️ Already processed order:", orderId);
        break;
      }

      // ─── mark as paid ───
      order.status = "paid";
      order.paidAt = new Date();
      order.stripePaymentId = session.payment_intent || null;

      await order.save();

      // ─── update earnings & stats ───
      for (const item of order.items) {
        await User.findByIdAndUpdate(item.contributor, {
          $inc: {
            "contributorProfile.totalEarnings":
              item.contributorEarning,
            "contributorProfile.pendingPayout":
              item.contributorEarning,
          },
        });

        await Image.findByIdAndUpdate(item.image._id, {
          $inc: {
            totalRevenue: item.priceAtSale,
          },
        });
      }

      // ─── email receipt ───
      const buyer = await User.findById(order.buyer);

      if (buyer) {
        const itemsList = order.items
          .map(
            (i) =>
              `<li>${i.image.title} — ${i.licenseType} license</li>`
          )
          .join("");

        await sendEmail({
          to: buyer.email,
          subject: `Receipt - ${order.invoiceNumber}`,
          html: `
            <h2>Thanks for your purchase, ${buyer.name}</h2>
            <p>Invoice: <b>${order.invoiceNumber}</b></p>
            <ul>${itemsList}</ul>
            <p>Total Paid: ₹${(order.totalAmount / 100).toFixed(2)}</p>
          `,
        });
      }

      console.log("✅ Order processed:", order.invoiceNumber);
      break;
    }

    break;
  } catch (err) {
    console.error("❌ Webhook error:", err);
  }

  break;
}

    // ─────────────────────────────────────────────
    // 2. PAYMENT FAILED
    // ─────────────────────────────────────────────
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;

      const { orderId } = session.metadata || {};

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          status: "failed",
        });
      }

      console.log("Payment failed:", orderId);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

export default webhookHandler;