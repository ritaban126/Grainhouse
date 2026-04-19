import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import { asyncHandler } from "../utils/asyncHandeller.js";
import { AppError } from "../utils/appError.js";

// Token helpers 
const signAccess  = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m" });
 
const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" });

const setRefreshCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   7 * 24 * 60 * 60 * 1000,  // 7 days
  });
};

const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken  = signAccess(user._id, user.role);
  const refreshToken = signRefresh(user._id);
 
  // Persist hashed refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
 
  setRefreshCookie(res, refreshToken);
 
  res.status(statusCode).json({
    success: true,
    accessToken,
    user,
  });
};

// register 
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;
 
  const existing = await User.findOne({ email });
  if (existing) return next(new AppError("Email already in use.", 409));
 
  // Generate email verification token
  const verifyToken = crypto.randomBytes(32).toString("hex");
 
  const user = await User.create({
    name,
    email,
    password,
    verifyToken,
    verifyTokenExpire: Date.now() + 24 * 60 * 60 * 1000,  // 24 hours
  });
 
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
 
  await sendEmail({
    to:      email,
    subject: "Verify your NichePix account",
    html: `
      <h2>Welcome to NichePix, ${name}!</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
 
  res.status(201).json({
    success: true,
    message: "Account created! Please check your email to verify.",
  });
});


// verify-email 
export const verifyEmail = asyncHandler(async (req, res, next) => {
  // sp.get("token") in frontend sends this in the URL query string
  const token = req.query.token; 

  if (!token) return next(new AppError("No token provided", 400));

  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpire: { $gt: Date.now() },
  }).select("+verifyToken +verifyTokenExpire");

  if (!user) return next(new AppError("Invalid or expired token.", 400));

  user.isVerified       = true;
  user.verifyToken       = undefined;
  user.verifyTokenExpire = undefined;
  
  await user.save({ validateBeforeSave: false });

  // This function signs JWTs and sends { success: true, accessToken, user }
  await sendTokenResponse(user, 200, res); 
});

// login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError("Email and password required.", 400));
 
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    return next(new AppError("Invalid credentials.", 401));
 
  if (!user.isVerified)
    return next(new AppError("Please verify your email before logging in.", 403));
 
  if (user.isBanned)
    return next(new AppError(`Account suspended: ${user.banReason}`, 403));
 
  await sendTokenResponse(user, 200, res);
});

// refresh 
export const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies.refreshToken;
  if (!token) return next(new AppError("No refresh token.", 401));
 
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return next(new AppError("Invalid refresh token.", 401));
  }
 
  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token)
    return next(new AppError("Refresh token mismatch.", 401));
 
  const accessToken     = signAccess(user._id, user.role);
  const newRefreshToken = signRefresh(user._id);
  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });
 
  setRefreshCookie(res, newRefreshToken);
  res.json({ success: true, accessToken });
});

// ── @POST /api/auth/logout ────────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+refreshToken");
  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out." });
});


 
// ── @POST /api/auth/forgot-password ──────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("No account with that email.", 404));
 
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken       = resetToken;
  user.resetTokenExpire = Date.now() + 60 * 60 * 1000;  // 1 hour
  await user.save({ validateBeforeSave: false });
 
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to:      user.email,
    subject: "NichePix password reset",
    html:    `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a>. Expires in 1 hour.</p>`,
  });
 
  res.json({ success: true, message: "Password reset link sent to your email." });
})

// ── @POST /api/auth/reset-password ───────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;
 
  const user = await User.findOne({
    resetToken:       token,
    resetTokenExpire: { $gt: Date.now() },
  }).select("+resetToken +resetTokenExpire");
 
  if (!user) return next(new AppError("Invalid or expired reset token.", 400));
 
  user.password         = password;
  user.resetToken       = undefined;
  user.resetTokenExpire = undefined;
  await user.save();
 
  res.json({ success: true, message: "Password reset successfully. Please log in." });
});


//  get request /me  get current user
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("savedImages", "thumbnailUrl title");
  res.json({ success: true, user });
});









