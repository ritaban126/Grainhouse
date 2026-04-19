// ─────────────────────────────────────────────────────────────
// brief.routes.js
// ─────────────────────────────────────────────────────────────
import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandeller.js";
import Brief from "../models/brifModel.js"
import { AppError } from "../utils/appError.js";

const briefRouter = express.Router();

// @GET  /api/briefs        — public list of open briefs
briefRouter.get("/", asyncHandler(async (req, res) => {
  const { niche, status = "open" } = req.query;
  const query = { status };
  if (niche) query.niche = niche;
  const briefs = await Brief.find(query)
    .populate("createdBy", "name")
    .sort("-createdAt");
  res.json({ success: true, briefs });
}));

// @GET  /api/briefs/:id
briefRouter.get("/:id", asyncHandler(async (req, res, next) => {
  const brief = await Brief.findById(req.params.id).populate("createdBy", "name");
  if (!brief) return next(new AppError("Brief not found.", 404));
  res.json({ success: true, brief });
}));

// @POST /api/briefs        — admin only
briefRouter.post("/", protect, restrictTo("admin"), asyncHandler(async (req, res) => {
  const brief = await Brief.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, brief });
}));

// @PATCH /api/briefs/:id   — admin only
// briefRouter.patch("/:id", protect, restrictTo("admin"), asyncHandler(async (req, res, next) => {
//   const brief = await Brief.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
//   if (!brief) return next(new AppError("Brief not found.", 404));
//   res.json({ success: true, brief });
// }));

// @POST /api/briefs/:id/upvote — authenticated
briefRouter.post("/:id/upvote", protect, asyncHandler(async (req, res, next) => {
  const brief = await Brief.findById(req.params.id);
  if (!brief) return next(new AppError("Brief not found.", 404));

  const hasVoted = brief.upvotes.includes(req.user.id);

  if (hasVoted) brief.upvotes.pull(req.user.id);  // 👈 HERE
  else brief.upvotes.push(req.user.id);

  await brief.save();

  res.json({
    success: true,
    upvoted: !hasVoted,
    count: brief.upvotes.length
  });
}));

export default briefRouter ;



