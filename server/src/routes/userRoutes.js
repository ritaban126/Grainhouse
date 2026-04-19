import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandeller.js";
import { AppError } from "../utils/appError.js";
import User from "../models/userModel.js";
import { uploadAvatar } from "../config/cloudinary.js";


const router = express.Router();


// @GET /api/users/:id/profile  — public contributor profile
router.get("/:id/profile", asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select("name avatar contributorProfile role createdAt");
  if (!user) return next(new AppError("User not found.", 404));
  res.json({ success: true, user });
}));


// @PATCH /api/users/me — update own profile
router.patch("/me", protect, asyncHandler(async (req, res) => {
  const allowed = ["name"];
  const user = await User.findById(req.user.id);
  allowed.forEach(f => { if (req.body[f]) user[f] = req.body[f]; });
 
  // Contributor bio fields
  if (user.role === "contributor") {
    const cpFields = ["bio","website","instagram","paypalEmail"];
    cpFields.forEach(f => {
      if (req.body[f] !== undefined) user.contributorProfile[f] = req.body[f];
    });
  }
  await user.save();
  res.json({ success: true, user });
}));
 
// @POST /api/users/me/avatar — upload avatar
router.post("/me/avatar", protect,restrictTo("contributor"), uploadAvatar.single("avatar"), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("File required.", 400);
  const user = await User.findById(req.user.id);
  user.avatar = { url: req.file.path, publicId: req.file.filename };
  await user.save();
  res.json({ success: true, avatar: user.avatar });
}));
 
// @POST /api/users/:id/follow — toggle follow a contributor
router.post("/:id/follow", protect, asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user.id) return next(new AppError("Cannot follow yourself.", 400));
  const me = await User.findById(req.user.id);
  const isFollowing = me.following.includes(req.params.id);
  if (isFollowing) me.following.pull(req.params.id);
  else             me.following.push(req.params.id);
  await me.save();
  res.json({ success: true, following: !isFollowing });
}));
 
// @GET /api/users/me/saved — my saved images
router.get("/me/saved", protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate({ path: "savedImages", select: "title thumbnailUrl niche licenses contributor status", match: { status: "approved" } });
  res.json({ success: true, savedImages: user.savedImages });
}));
 
export default router;