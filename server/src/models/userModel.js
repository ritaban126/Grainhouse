import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      required: true,
      select: false,
    },

    // ── ROLE ─────────────────────────────────────────────
    role: {
      type: String,
      enum: ["user", "contributor", "admin"],
      default: "user",
    },

    // ── AUTH ─────────────────────────────────────────────
    isVerified: { type: Boolean, default: false },

    verifyToken: { type: String, select: false },
    verifyTokenExpire: { type: Date, select: false },

    resetToken: { type: String, select: false },
    resetTokenExpire: { type: Date, select: false },

    refreshToken: { type: String, select: false },

    // ── STATUS ───────────────────────────────────────────
    isBanned: { type: Boolean, default: false },
    banReason: { type: String, default: "" },

    // ── PLAN ─────────────────────────────────────────────
    plan: {
      type: String,
      enum: ["free", "creator", "studio"],
      default: "free",
    },

    credits: {
      type: Number,
      default: 0,
      min: 0,
    },

    planExpiresAt: { type: Date, default: null },
    stripeCustomerId: { type: String, default: null },

    // ── FREE USAGE ───────────────────────────────────────
    freeDownloadsUsed: { type: Number, default: 0 },
    freeDownloadsResetAt: { type: Date, default: Date.now },

    // ── SOCIAL ───────────────────────────────────────────
    savedImages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],

    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],

    // ── CONTRIBUTOR PROFILE ─────────────────────────────
    contributorProfile: {
      displayName: { type: String, default: "" },
      bio: { type: String, maxlength: 500, default: "" },

      profilePhoto: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
      },

      website: { type: String, default: "" },
      instagram: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },

      totalEarnings: { type: Number, default: 0 },
      pendingPayout: { type: Number, default: 0 },
      totalDownloads: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },

      isApproved: { type: Boolean, default: false },
      appliedAt: { type: Date, default: null },

      followers: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      ],

      followersCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ "contributorProfile.isApproved": 1 });

// ─────────────────────────────────────────────
// PASSWORD HASH (FIXED)
// ─────────────────────────────────────────────
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  if (!this.password) return;

  this.password = await bcrypt.hash(this.password, 12);
});

// ─────────────────────────────────────────────
// PASSWORD CHECK
// ─────────────────────────────────────────────
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ─────────────────────────────────────────────
// CLEAN OUTPUT
// ─────────────────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.refreshToken;
  delete obj.verifyToken;
  delete obj.resetToken;

  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;