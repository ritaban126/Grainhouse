import Stripe from "stripe"; 
import Order from "../models/orderModel.js"
import Image from "../models/imageModel.js"
import User from "../models/userModel.js"
import { sendEmail } from "../utils/email.js"
import { asyncHandler } from "../utils/asyncHandeller.js"
import { AppError } from "../utils/appError.js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// ── @POST /api/payments/checkout ──────────────────────────────────────────────
// Create Stripe Checkout session for image(s)
export const createCheckout = asyncHandler(async (req, res, next) => {
  const { items } = req.body;
  // items: [{ imageId, licenseType }]
 
  if (!items?.length) return next(new AppError("No items provided.", 400));
 
  // Fetch images
  const imageIds = items.map(i => i.imageId);
  const images   = await Image.find({ _id: { $in: imageIds }, status: "approved" });
 
  if (images.length !== items.length)
    return next(new AppError("One or more images not found or not available.", 404));
 
  // Build line items for Stripe
  const lineItems = items.map(item => {
    const img     = images.find(i => i._id.toString() === item.imageId);
    const license = img.licenses.find(l => l.type === item.licenseType);
    if (!license) throw new AppError(`License "${item.licenseType}" not found for image "${img.title}".`, 400);
 
    return {
      price_data: {
        currency:     "inr",
        product_data: {
          name:        img.title,
          description: `${item.licenseType} license`,
          images:      [img.cloudinary.thumbnailUrl],
          metadata:    { imageId: img._id.toString(), licenseType: item.licenseType },
        },
        unit_amount: license.price,   // in paise
      },
      quantity: 1,
    };
  });
 
  const totalAmount = lineItems.reduce((s, l) => s + l.price_data.unit_amount, 0);
 
  // Create pending order in DB first
  const orderItems = items.map(item => {
    const img     = images.find(i => i._id.toString() === item.imageId);
    const license = img.licenses.find(l => l.type === item.licenseType);
    return {
      image:              img._id,
      licenseType:        item.licenseType,
      priceAtSale:        license.price,
      contributor:        img.contributor,
      contributorEarning: Math.round(license.price * 0.6),   // 60%
    };
  });
 
  const order = await Order.create({
    buyer:         req.user.id,
    items:         orderItems,
    paymentMethod: "stripe",
    totalAmount,
    status:        "pending",
  });
 
  // Stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items:           lineItems,
    mode:                 "payment",
    success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.CLIENT_URL}/checkout/cancel`,
    customer_email: req.user.email,
    metadata: {
      orderId: order._id.toString(),
      userId:  req.user.id,
    },
  });
 
  // Save session ID to order
  order.stripeSessionId = session.id;
  await order.save();
 
  res.json({ success: true, url: session.url, orderId: order._id });
});
 
// ── @POST /api/payments/credits/checkout ──────────────────────────────────────
// Buy credit packs via Stripe
export const buyCreditPack = asyncHandler(async (req, res, next) => {
  const PACKS = {
    starter:      { credits: 5,   amount: 49900  },   // ₹499
    popular:      { credits: 20,  amount: 159900 },   // ₹1599
    professional: { credits: 50,  amount: 349900 },   // ₹3499
  };
 
  const { packId } = req.body;
  const pack = PACKS[packId];
  if (!pack) return next(new AppError("Invalid credit pack.", 400));
 
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{
      price_data: {
        currency:     "inr",
        product_data: { name: `NichePix ${pack.credits} Credits`, description: "Never expire" },
        unit_amount:  pack.amount,
      },
      quantity: 1,
    }],
    mode:          "payment",
    success_url:   `${process.env.CLIENT_URL}/dashboard?credits=added`,
    cancel_url:    `${process.env.CLIENT_URL}/pricing`,
    customer_email: req.user.email,
    metadata: {
      type:    "credits",
      credits: pack.credits.toString(),
      userId:  req.user.id,
    },
  });
 
  res.json({ success: true, url: session.url });
});
 
// ── @POST /api/payments/spend-credits ─────────────────────────────────────────
// Purchase image using credits (no Stripe)
export const spendCredits = asyncHandler(async (req, res, next) => {
  const { imageId, licenseType } = req.body;
 
  const image = await Image.findById(imageId);
  if (!image || image.status !== "approved")
    return next(new AppError("Image not found.", 404));
 
  const license = image.licenses.find(l => l.type === licenseType);
  if (!license) return next(new AppError("License type not found.", 404));
 
  const user = await User.findById(req.user.id);
  if (user.credits < license.creditCost)
    return next(new AppError(`Insufficient credits. Need ${license.creditCost}, have ${user.credits}.`, 400));
 
  // Check not already purchased
  const existing = await Order.findOne({
    buyer:             req.user.id,
    status:            "paid",
    "items.image":     imageId,
    "items.licenseType": licenseType,
  });
  if (existing) return next(new AppError("Already purchased.", 400));
 
  // Deduct credits + create paid order
  user.credits -= license.creditCost;
  await user.save();
 
  const earning = Math.round(license.price * 0.6);
  const order = await Order.create({
    buyer:         req.user.id,
    items: [{
      image:              image._id,
      licenseType,
      priceAtSale:        license.price,
      creditsCost:        license.creditCost,
      contributor:        image.contributor,
      contributorEarning: earning,
    }],
    paymentMethod: "credits",
    totalAmount:   license.price,
    creditsUsed:   license.creditCost,
    status:        "paid",
    paidAt:        new Date(),
  });
 
  // Update contributor earnings
  await User.findByIdAndUpdate(image.contributor, {
    $inc: {
      "contributorProfile.totalEarnings": earning,
      "contributorProfile.pendingPayout": earning,
    },
  });
 
  // Update image stats
  await Image.findByIdAndUpdate(imageId, {
    $inc: { totalDownloads: 1, totalRevenue: license.price },
  });
 
  res.json({ success: true, order });
});
 
// ── @GET /api/payments/orders ─────────────────────────────────────────────────
// User's order history
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user.id, status: "paid" })
    .populate("items.image", "title thumbnailUrl niche")
    .sort("-paidAt");
 
  res.json({ success: true, orders });
});
