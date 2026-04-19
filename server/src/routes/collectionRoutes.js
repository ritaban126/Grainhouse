import express from "express"
import Collection from "../models/collectionModel.js";
import { asyncHandler } from "../utils/asyncHandeller.js";
import { AppError } from "../utils/appError.js";
import { protect } from "../middleware/authMiddleware.js";

const collectionRouter = express.Router();

// @GET /api/collections/public — browse public collections
collectionRouter.get("/public", asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const collections = await Collection.find({ isPublic: true })
    .populate("owner", "name avatar")
    .sort({ saveCount: -1 })
    .skip(skip)
    .limit(Number(limit));
  res.json({ success: true, collections });
}));

// @GET /api/collections/me — my collections
collectionRouter.get("/me", protect, asyncHandler(async (req, res) => {
  const collections = await Collection.find({ owner: req.user.id })
    .sort("-createdAt");
  res.json({ success: true, collections });
}));

// @POST /api/collections — create collection
collectionRouter.post("/", protect, asyncHandler(async (req, res) => {
  const col = await Collection.create({ ...req.body, owner: req.user.id });
  res.status(201).json({ success: true, collection: col });
}));

// @PATCH /api/collections/:id — update
collectionRouter.patch("/:id", protect, asyncHandler(async (req, res, next) => {
  const col = await Collection.findOne({ _id: req.params.id, owner: req.user.id });
  if (!col) return next(new AppError("Collection not found.", 404));
  Object.assign(col, req.body);
  await col.save();
  res.json({ success: true, collection: col });
}));

// @POST /api/collections/:id/images — add image to collection
collectionRouter.post("/:id/images", protect, asyncHandler(async (req, res, next) => {
  const col = await Collection.findOne({
    _id: req.params.id,
    owner: req.user.id
  });

  if (!col) return next(new AppError("Collection not found.", 404));

  const already = col.images.some(
    (i) => i.image?.toString() === req.body.imageId
  );

  if (!already) {
    col.images.push({ image: req.body.imageId });

    // THIS is where saveCount should increase
    col.saveCount += 1;
  }

  await col.save();

  res.json({ success: true, collection: col });
}));

// @DELETE /api/collections/:id/images/:imageId
collectionRouter.delete(
  "/:id/images/:imageId",
  protect,
  asyncHandler(async (req, res, next) => {
    const { id, imageId } = req.params;

    const col = await Collection.findOne({
      _id: id,
      owner: req.user.id,
    });

    if (!col) return next(new AppError("Collection not found.", 404));

    const beforeLength = col.images.length;

    col.images = col.images.filter(
      (i) => i.image?.toString() !== imageId
    );

    // optional: check if image actually existed
    if (col.images.length === beforeLength) {
      return next(new AppError("Image not found in collection.", 404));
    }

    await col.save();

    res.json({
      success: true,
      message: "Image removed from collection",
      collection: col,
    });
  })
);

export  default  collectionRouter ;