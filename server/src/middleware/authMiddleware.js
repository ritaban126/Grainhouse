// import jwt from "jsonwebtoken"
// import User from "../models/userModel.js"
// import { asyncHandler } from "../utils/asyncHandeller.js";
// import { AppError } from "../utils/appError.js";


// // ── Verify JWT access token ───────────────────────────────────────────────────
// export const protect = asyncHandler(async (req, res, next) => {
//   let token;
 
//   if (req.headers.authorization?.startsWith("Bearer ")) {
//     token = req.headers.authorization.split(" ")[1];
//   }
 
//   if (!token) return next(new AppError("Not authenticated. Please log in.", 401));
 
//   let decoded;
//   try {
//     decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//   } catch (err) {
//     return next(new AppError("Invalid or expired token.", 401));
//   }
 
//   const user = await User.findById(decoded.id);
//   if (!user)          return next(new AppError("User no longer exists.", 401));
//   if (user.isBanned)  return next(new AppError("Account suspended.", 403));
 
//   req.user = { id: user._id.toString(), role: user.role, email: user.email };
//   next();
// });
 
// // ── Optional auth — attaches user if token present, doesn't block if not ──────
// export const optionalAuth = asyncHandler(async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (token) {
//       const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
//       req.user = { id: decoded.id, role: decoded.role };
//     }
//   } catch { /* ignore */ }
//   next();
// });

// // Usage: restrictTo("contributor") or restrictTo("buyer","contributor")
// export const restrictTo = (...roles) => (req, res, next) => {
//   if (!roles.includes(req.user?.role))
//     return next(
//       new AppError(`Access denied. Required: ${roles.join(" or ")}.`, 403)
//     );
//   next();
// };

// // Use this instead of restrictTo("contributor") everywhere in contributor routes
// export const contributorOnly = (req, res, next) => {
//   if (req.user?.role !== "contributor")
//     return next(
//       new AppError("Access denied. Contributors only.", 403)
//     );
//   next();
// };


import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandeller.js";
import { AppError } from "../utils/appError.js";


// ─────────────────────────────────────────────────────────────
// PROTECT (MAIN AUTH MIDDLEWARE)
// ─────────────────────────────────────────────────────────────
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Not authenticated. Please log in.", 401));
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please log in again.", 401));
    }
    return next(new AppError("Invalid token.", 401));
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User no longer exists.", 401));
  }

  if (user.isBanned) {
    return next(new AppError("Account suspended.", 403));
  }

  // ✔ FIX: attach FULL usable user context (not partial)
  req.user = {
    id: user._id.toString(),
    role: user.role,
    email: user.email,

    // important for payment + UI logic
    credits: user.credits,
    plan: user.plan,
  };

  next();
});


// ─────────────────────────────────────────────────────────────
// OPTIONAL AUTH (SAFE DEBUG VERSION)
// ─────────────────────────────────────────────────────────────
export const optionalAuth = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      const user = await User.findById(decoded.id);

      if (user) {
        req.user = {
          id: user._id.toString(),
          role: user.role,
          email: user.email,
        };
      }
    }
  } catch (err) {
    console.log("optionalAuth error:", err.message);
  }

  next();
});


// ─────────────────────────────────────────────────────────────
// ROLE BASED ACCESS CONTROL
// ─────────────────────────────────────────────────────────────
export const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Not authenticated.", 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(`Access denied. Required role: ${roles.join(" or ")}`, 403)
    );
  }

  next();
};