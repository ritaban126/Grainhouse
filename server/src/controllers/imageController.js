import Image from "../models/imageModel.js"
import order from "../models/orderModel.js"
import User from "../models/userModel.js"
import {cloudinary } from "../config/cloudinary.js"
import { asyncHandler } from "../utils/asyncHandeller.js";
import { AppError } from "../utils/appError.js";



//  @GET /api/images 
// Public: search, filter, paginate approved images
export const getImages = asyncHandler(async (req, res) => {
  const {
    q, niche, mood, colors, orientation,
    minPrice, maxPrice, isFree, isFeatured,
    sort = "-createdAt", page = 1, limit = 24,
  } = req.query;
 
  const query = { status: "approved" };
 
  // Full-text search
  if (q) query.$text = { $search: q };
 
  // Filters
  if (niche)       query.niche = niche;
  if (orientation) query.orientation = orientation;
  if (isFree)      query.isFree = isFree === "true";
  if (isFeatured)  query.isFeatured = true;
  if (mood)        query.mood = { $in: mood.split(",") };
  if (colors)      query.colors = { $in: colors.split(",") };
 
  if (minPrice || maxPrice) {
    query["licenses.price"] = {};
    if (minPrice) query["licenses.price"].$gte = Number(minPrice);
    if (maxPrice) query["licenses.price"].$lte = Number(maxPrice);
  }
 
  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Image.countDocuments(query);
 
  const images = await Image.find(query)
    .select("-cloudinary.originalUrl")   // never leak full-res publicly
    .populate("contributor", "name avatar contributorProfile.bio")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));
 
  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    images,
  });
});


// ── @GET /api/images/:id ──────────────────────────────────────────────────────
// Public: single image detail (no originalUrl)
export const getImageById = asyncHandler(async (req, res, next) => {
  const image = await Image.findById(req.params.id)
    .select("-cloudinary.originalUrl")
    .populate("contributor", "name avatar contributorProfile following")
    .populate("brief", "title niche");
 
  if (!image || image.status !== "approved")
    return next(new AppError("Image not found.", 404));
 
  // Increment view count (non-blocking)
  Image.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();
 
  // Check if requesting user already purchased this image
  let purchased = false;
  if (req.user) {
    const order = await Order.findOne({
      buyer:  req.user.id,
      status: "paid",
      "items.image": image._id,
    });
    purchased = !!order;
  }
 
  res.json({ success: true, image, purchased });
});


// ── @GET /api/images/:id/download ─────────────────────────────────────────────
// Protected: return full-res URL only if order exists
export const downloadImage = asyncHandler(async (req, res, next) => {
  const imageId = req.params.id;
  const { licenseType } = req.query;

  if (!licenseType) {
    return next(new AppError("License type is required.", 400));
  }

  // 1. Get image
  const image = await Image.findById(imageId);
  if (!image || image.status !== "approved") {
    return next(new AppError("Image not found.", 404));
  }

  // 2. Check purchase
  const order = await Order.findOne({
    buyer: req.user.id,
    status: "paid",
    items: {
      $elemMatch: {
        image: image._id,
        licenseType,
      },
    },
  });

  if (!order) {
    return next(
      new AppError("You have not purchased this image with this license.", 403)
    );
  }

  // 3. Check global download limit (NEW LOGIC)
  if (
    image.maxDownloads > 0 &&
    image.downloadCount >= image.maxDownloads
  ) {
    return next(new AppError("This image has reached max download limit.", 403));
  }

  // 4. Find correct order item
  const item = order.items.find(
    (i) =>
      i.image.toString() === imageId &&
      i.licenseType === licenseType
  );

  if (!item) {
    return next(new AppError("Order item not found.", 404));
  }

  // 5. Per-order download limit (optional rule)
  if (item.downloadCount >= 5) {
    return next(new AppError("Download limit reached for this purchase.", 403));
  }

  // 6. Increment BOTH counters safely
  item.downloadCount += 1;
  await order.save();

  image.downloadCount += 1;
  await image.save();

  // 7. Update analytics
  await User.findByIdAndUpdate(image.contributor, {
    $inc: {
      "contributorProfile.totalDownloads": 1,
    },
  });

  // 8. Return file URL
  return res.json({
    success: true,
    downloadUrl: image.cloudinary.originalUrl,
  });
});


// ── @GET /api/images/trending ─────────────────────────────────────────────────
export const getTrending = asyncHandler(async (req, res) => {
  const { niche, limit = 12 } = req.query;
  const query = { status: "approved" };
  if (niche) query.niche = niche;
 
  const images = await Image.find(query)
    .select("-cloudinary.originalUrl")
    .sort({ totalDownloads: -1, viewCount: -1 })
    .limit(Number(limit))
    .populate("contributor", "name avatar");
 
  res.json({ success: true, images });
});


// ── @POST /api/images ─────────────────────────────────────────────────────────
// Contributor: upload image (file handled by multer middleware)
export const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new AppError("Image file required.", 400));
 
  const {
    title, description, niche, category,
    tags, useCases, mood, colors, orientation,
    licenses, briefId,
  } = req.body;
 
  // Multer-cloudinary already uploaded; get URLs from eager transforms
  const { path: originalUrl, filename: publicId } = req.file;
  const eagerResults = req.file.eager || [];
  const previewUrl   = eagerResults[0]?.secure_url || originalUrl;
  const thumbnailUrl = eagerResults[1]?.secure_url || originalUrl;
 
  const image = await Image.create({
    title,
    description,
    contributor: req.user.id,
    cloudinary: {
      publicId,
      originalUrl,
      previewUrl,
      thumbnailUrl,
      width:  req.file.width,
      height: req.file.height,
      format: req.file.format,
      bytes:  req.file.size,
    },
    niche,
    category,
    tags:        tags        ? JSON.parse(tags)     : [],
    useCases:    useCases    ? JSON.parse(useCases) : [],
    mood:        mood        ? JSON.parse(mood)      : [],
    colors:      colors      ? JSON.parse(colors)    : [],
    orientation: orientation || "landscape",
    licenses:    licenses    ? JSON.parse(licenses)  : [],
    brief:       briefId     || null,
    status:      "pending",
  });
 
  res.status(201).json({ success: true, image });
});


// ── @PATCH /api/images/:id ────────────────────────────────────────────────────
// Contributor edits own image metadata (before approval)
export const updateImage = asyncHandler(async (req, res, next) => {
  const image = await Image.findById(req.params.id);
  if (!image) return next(new AppError("Image not found.", 404));
 
  // Allow contributor to edit own, admin to edit any
  if (image.contributor.toString() !== req.user.id && req.user.role !== "admin")
    return next(new AppError("Not authorised.", 403));
 
  const allowed = ["title","description","tags","useCases","mood","colors","orientation","licenses","niche","category"];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) image[field] = req.body[field];
  });
 
  await image.save();
  res.json({ success: true, image });
});

// ── @DELETE /api/images/:id ───────────────────────────────────────────────────
export const deleteImage = asyncHandler(async (req, res, next) => {
  const image = await Image.findById(req.params.id);
  if (!image) return next(new AppError("Image not found.", 404));
 
  if (image.contributor.toString() !== req.user.id && req.user.role !== "admin")
    return next(new AppError("Not authorised.", 403));
 
  // Remove from Cloudinary
  await cloudinary.uploader.destroy(image.cloudinary.publicId);
  await image.deleteOne();
 
  res.json({ success: true, message: "Image deleted." });
});


// ── @POST /api/images/:id/save ────────────────────────────────────────────────
export const toggleSave = asyncHandler(async (req, res) => {
  const user  = await User.findById(req.user.id);
  const imgId = req.params.id;
 
  const alreadySaved = user.savedImages.includes(imgId);
 
  if (alreadySaved) {
    user.savedImages.pull(imgId);
    await Image.findByIdAndUpdate(imgId, { $inc: { saveCount: -1 } });
  } else {
    user.savedImages.push(imgId);
    await Image.findByIdAndUpdate(imgId, { $inc: { saveCount: 1 } });
  }
 
  await user.save();
  res.json({ success: true, saved: !alreadySaved });
});