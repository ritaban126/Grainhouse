

// import express        from "express";
// import User           from "../models/userModel.js";
// import Image from "../models/imageModel.js";
// import Order from "../models/orderModel.js";
// import { protect } from "../middleware/authMiddleware.js";
// import { asyncHandler } from "../utils/asyncHandeller.js";
// import { AppError }     from "../utils/appError.js";
// import { sendEmail }    from "../utils/email.js";
// import { uploadImage }  from "../config/cloudinary.js";

// const router = express.Router();

// // ─────────────────────────────────────────────────────────────
// // PUBLIC-ISH — any logged-in user
// // ─────────────────────────────────────────────────────────────

// // @POST /api/contributors/apply
// // Any logged-in user applies to become a contributor
// router.post("/apply", protect, asyncHandler(async (req, res, next) => {
//   const user = await User.findById(req.user.id);

//   if (user.role === "contributor")
//     return next(new AppError("You are already a contributor.", 400));

//   const {
//     displayName, bio, website, instagram,
//     linkedin, twitter,
//     payoutMethod, accountHolder, accountNumber,
//     ifscCode, bankName, upiId,
//   } = req.body;

//   // Upgrade role to contributor
//   user.role = "contributor";

//   user.contributorProfile = {
//     ...user.contributorProfile,
//     displayName: displayName || user.name,
//     bio:         bio         || "",
//     website:     website     || "",
//     instagram:   instagram   || "",
//     linkedin:    linkedin    || "",
//     twitter:     twitter     || "",
//     isApproved:  true,          // auto-approve — remove this line if you want manual approval
//     appliedAt:   new Date(),
//     // payoutDetails: {
//     //   method:        payoutMethod    || "bank",
//     //   accountHolder: accountHolder   || "",
//     //   accountNumber: accountNumber   || "",
//     //   ifscCode:      (ifscCode || "").toUpperCase().trim(),
//     //   bankName:      bankName        || "",
//     //   upiId:         upiId           || "",
//     // },
//   };

//   await user.save();



//   // Welcome the contributor
//   await sendEmail({
//     to:      user.email,
//     subject: "Welcome to Grainhouse — you're a contributor!",
//     html: `
//       <h2>Welcome, ${user.name}!</h2>
//       <p>Your contributor account is ready. You can now upload images.</p>
//       <p><a href="${process.env.CLIENT_URL}/contributor/upload">Upload your first image →</a></p>
//     `,
//   });

//   res.status(201).json({
//     success: true,
//     message: "You are now a contributor. Start uploading!",
//     user,
//   });
// }));

// // ─────────────────────────────────────────────────────────────
// // CONTRIBUTOR ONLY — all routes below require contributor role
// // ─────────────────────────────────────────────────────────────

// // @GET /api/contributors/me/stats
// // Earnings dashboard data
// router.get("/me/stats", protect, asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id)
//     .select("contributorProfile name email avatar");

//   // Monthly earnings — last 6 months
//   const sixMonthsAgo = new Date();
//   sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

//   const monthlyEarnings = await Order.aggregate([
//     {
//       $match: {
//         status:              "paid",
//         paidAt:              { $gte: sixMonthsAgo },
//         "items.contributor": user._id,
//       },
//     },
//     { $unwind: "$items" },
//     { $match: { "items.contributor": user._id } },
//     {
//       $group: {
//         _id: {
//           month: { $month: "$paidAt" },
//           year:  { $year:  "$paidAt" },
//         },
//         earnings:  { $sum: "$items.contributorEarning" },
//         salesCount:{ $sum: 1 },
//       },
//     },
//     { $sort: { "_id.year": 1, "_id.month": 1 } },
//   ]);

//   // Recent sales — last 10
//   const recentSales = await Order.find({
//     status:              "paid",
//     "items.contributor": user._id,
//   })
//     .sort("-paidAt")
//     .limit(10)
//     .populate("items.image", "title thumbnailUrl cloudinary")
//     .populate("buyer", "name");

//   // Top 5 images by revenue
//   const topImages = await Image.find({
//     contributor: req.user.id,
//     status:      "approved",
//   })
//     .select("title thumbnailUrl totalDownloads totalRevenue cloudinary")
//     .sort({ totalRevenue: -1 })
//     .limit(5);

//   res.json({
//     success: true,
//     stats: {
//       profile: user.contributorProfile,
//       monthlyEarnings,
//       recentSales,
//       topImages,
//     },
//   });
// }));

// // @GET /api/contributors/me/images
// // All images this contributor uploaded
// router.get("/me/images", protect,  asyncHandler(async (req, res) => {
//   const { status, page = 1, limit = 24 } = req.query;
//   const skip = (Number(page) - 1) * Number(limit);

//   const query = { contributor: req.user.id };
//   if (status) query.status = status;   // ?status=approved / pending / rejected

//   const [images, total] = await Promise.all([
//     Image.find(query)
//       .sort("-createdAt")
//       .skip(skip)
//       .limit(Number(limit)),
//     Image.countDocuments(query),
//   ]);

//   res.json({
//     success: true,
//     total,
//     page:   Number(page),
//     images,
//   });
// }));

// // @PATCH /api/contributors/me/profile
// // Update own profile — bio, social links, payout details
// router.patch("/me/profile", protect,  asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user.id);

//   const {
//     displayName, bio,
//     website, instagram, linkedin, twitter,
//     payoutMethod, accountHolder, accountNumber,
//     ifscCode, bankName, upiId,
//   } = req.body;

//   // Update only fields that were sent
//   if (displayName !== undefined) user.contributorProfile.displayName = displayName;
//   if (bio         !== undefined) user.contributorProfile.bio         = bio;
//   if (website     !== undefined) user.contributorProfile.website     = website;
//   if (instagram   !== undefined) user.contributorProfile.instagram   = instagram;
//   if (linkedin    !== undefined) user.contributorProfile.linkedin    = linkedin;
//   if (twitter     !== undefined) user.contributorProfile.twitter     = twitter;

//   // Update payout details only if method was provided
//   if (payoutMethod) {
//     user.contributorProfile.payoutDetails = {
//       method:        payoutMethod,
//       accountHolder: accountHolder || "",
//       accountNumber: accountNumber || "",
//       ifscCode:      (ifscCode || "").toUpperCase().trim(),
//       bankName:      bankName  || "",
//       upiId:         upiId    || "",
//     };
//   }

//   await user.save();
//   res.json({ success: true, user });
// }));

// // @POST /api/contributors/me/payout-request
// // Request a payout of pending earnings
// router.post("/me/payout-request", protect,  asyncHandler(async (req, res, next) => {
//   const MINIMUM_PAYOUT = 50000; // ₹500 in paise
//   const user = await User.findById(req.user.id);

//   const pending = user.contributorProfile.pendingPayout;
//   const details = user.contributorProfile.payoutDetails;

//   if (pending < MINIMUM_PAYOUT)
//     return next(
//       new AppError(
//         `Minimum payout is ₹${MINIMUM_PAYOUT / 100}. You have ₹${(pending / 100).toFixed(0)} pending.`,
//         400
//       )
//     );

//   // Check payout details are filled
//   const hasBank = details?.method === "bank" && details?.accountNumber;
//   const hasUPI  = details?.method === "upi"  && details?.upiId;

//   if (!hasBank && !hasUPI)
//     return next(
//       new AppError("Please add your bank or UPI details in profile settings first.", 400)
//     );

//   // Zero out pendingPayout to prevent double requests
//   const amount = user.contributorProfile.pendingPayout;
//   user.contributorProfile.pendingPayout = 0;
//   await user.save();

//   // Email you (admin) with transfer details
//   await sendEmail({
//     to:      process.env.ADMIN_EMAIL,
//     subject: `Payout request — ₹${(amount / 100).toFixed(0)} — ${user.name}`,
//     html: `
//       <h2>Payout request</h2>
//       <p><strong>Name:</strong> ${user.name}</p>
//       <p><strong>Email:</strong> ${user.email}</p>
//       <p><strong>Amount:</strong> ₹${(amount / 100).toFixed(2)}</p>
//       <p><strong>Method:</strong> ${details.method === "upi" ? "UPI" : "Bank Transfer"}</p>
//       ${details.method === "bank" ? `
//         <p><strong>Account holder:</strong> ${details.accountHolder}</p>
//         <p><strong>Account number:</strong> ${details.accountNumber}</p>
//         <p><strong>IFSC:</strong> ${details.ifscCode}</p>
//         <p><strong>Bank:</strong> ${details.bankName}</p>
//       ` : `
//         <p><strong>UPI ID:</strong> ${details.upiId}</p>
//       `}
//     `,
//   });

//   // Confirm to contributor
//   await sendEmail({
//     to:      user.email,
//     subject: "Payout request received — Grainhouse",
//     html: `
//       <h2>Payout request received</h2>
//       <p>Hi ${user.name}, we received your payout request for <strong>₹${(amount / 100).toFixed(2)}</strong>.</p>
//       <p>We'll transfer within 3 business days and send a confirmation email.</p>
//     `,
//   });

//   res.json({
//     success: true,
//     message: "Payout request submitted. Expect transfer within 3 business days.",
//     amount,
//   });
// }));

// export default router;


import express from "express";
import User from "../models/userModel.js";
import Image from "../models/imageModel.js";
import Order from "../models/orderModel.js";

import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandeller.js";
import { AppError } from "../utils/appError.js";

const router = express.Router();


// ─────────────────────────────────────────────
// GLOBAL MIDDLEWARE (IMPORTANT CLEANUP)
// ─────────────────────────────────────────────
router.use(protect);
router.use(restrictTo("contributor"));


// ─────────────────────────────────────────────
// APPLY AS CONTRIBUTOR (only first time upgrade)
// ─────────────────────────────────────────────
router.post(
  "/apply",
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (user.role === "contributor") {
      return next(new AppError("Already a contributor.", 400));
    }

    const {
      displayName,
      bio,
      website,
      instagram,
      linkedin,
      twitter,
    } = req.body;

    user.role = "contributor";

    user.contributorProfile = {
      ...user.contributorProfile,
      displayName: displayName || user.name,
      bio: bio || "",
      website: website || "",
      instagram: instagram || "",
      linkedin: linkedin || "",
      twitter: twitter || "",
      isApproved: true,
      appliedAt: new Date(),
    };

    await user.save();

    res.status(201).json({
      success: true,
      message: "You are now a contributor.",
      user,
    });
  })
);


// ─────────────────────────────────────────────
// STATS DASHBOARD
// ─────────────────────────────────────────────
router.get(
  "/me/stats",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select(
      "contributorProfile name email avatar"
    );

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await Order.aggregate([
      {
        $match: {
          status: "paid",
          paidAt: { $gte: sixMonthsAgo },
          "items.contributor": user._id,
        },
      },
      { $unwind: "$items" },
      {
        $match: {
          "items.contributor": user._id,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$paidAt" },
            year: { $year: "$paidAt" },
          },
          earnings: { $sum: "$items.contributorEarning" },
          salesCount: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const recentSales = await Order.find({
      status: "paid",
      "items.contributor": user._id,
    })
      .sort("-paidAt")
      .limit(10)
      .populate("items.image", "title thumbnailUrl")
      .populate("buyer", "name");

    const topImages = await Image.find({
      contributor: req.user.id,
      status: "approved",
    })
      .select("title thumbnailUrl totalDownloads totalRevenue")
      .sort({ totalRevenue: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        profile: user.contributorProfile,
        monthlyEarnings,
        recentSales,
        topImages,
      },
    });
  })
);


// ─────────────────────────────────────────────
// MY IMAGES
// ─────────────────────────────────────────────
router.get(
  "/me/images",
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 24 } = req.query;

    const query = { contributor: req.user.id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [images, total] = await Promise.all([
      Image.find(query)
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Image.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      images,
    });
  })
);


// ─────────────────────────────────────────────
// UPDATE PROFILE
// ─────────────────────────────────────────────
router.patch(
  "/me/profile",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    const {
      displayName,
      bio,
      website,
      instagram,
      linkedin,
      twitter,
      payoutMethod,
      accountHolder,
      accountNumber,
      ifscCode,
      bankName,
      upiId,
    } = req.body;

    if (displayName !== undefined)
      user.contributorProfile.displayName = displayName;

    if (bio !== undefined) user.contributorProfile.bio = bio;
    if (website !== undefined) user.contributorProfile.website = website;
    if (instagram !== undefined)
      user.contributorProfile.instagram = instagram;
    if (linkedin !== undefined)
      user.contributorProfile.linkedin = linkedin;
    if (twitter !== undefined)
      user.contributorProfile.twitter = twitter;

    if (payoutMethod) {
      user.contributorProfile.payoutDetails = {
        method: payoutMethod,
        accountHolder: accountHolder || "",
        accountNumber: accountNumber || "",
        ifscCode: (ifscCode || "").toUpperCase().trim(),
        bankName: bankName || "",
        upiId: upiId || "",
      };
    }

    await user.save();

    res.json({
      success: true,
      user,
    });
  })
);

export default router;