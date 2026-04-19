// import mongoose from "mongoose";


// const licenseSchema = new mongoose.Schema({
//   type:  { type: String, enum: ["personal", "commercial", "extended"], required: true },
//   price: { type: Number, required: true, min: 0 },           // in cents (₹ paise)
//   creditCost: { type: Number, required: true, min: 0 },      // how many credits to spend
//   platforms:  { type: [String], default: [] },               // e.g. ["YouTube","Etsy"]
// }, { _id: false });


// const imageSchema = new mongoose.Schema(
//   {
//     // ── Core ──────────────────────────────────────────────────────────────────
//     title:       { type: String, required: true, trim: true, maxlength: 150 },
//     description: { type: String, trim: true, maxlength: 1000, default: "" },
 
//     // ── Contributor ───────────────────────────────────────────────────────────
//     contributor: {
//       type:     mongoose.Schema.Types.ObjectId,
//       ref:      "User",
//       required: true,
//       index:    true,
//     },
 
//     // ── Cloudinary ────────────────────────────────────────────────────────────
//     cloudinary: {
//       publicId:       { type: String, required: true },
//       // Full-res URL (only returned after purchase check)
//       originalUrl:    { type: String, required: true },
//       // Watermarked 800px preview — public
//       previewUrl:     { type: String, required: true },
//       // 300×300 thumbnail — public
//       thumbnailUrl:   { type: String, required: true },
//       width:          { type: Number },
//       height:         { type: Number },
//       format:         { type: String },
//       bytes:          { type: Number },
//     },
 
//     // ── Taxonomy ──────────────────────────────────────────────────────────────
//     niche: {
//       type: String,
//       enum: ["YouTube","Podcast","Notion","Game Dev","Newsletter","Blog","General"],
//       required: true,
//       index: true,
//     },
//     category: { type: String, trim: true, default: "" },
//     tags:      { type: [String], default: [], index: true },
//     useCases:  { type: [String], default: [] },   // e.g. ["thumbnail","end-screen"]
//     mood:      { type: [String], default: [] },   // e.g. ["dark","moody","minimal"]
//     colors:    { type: [String], default: [] },   // dominant hex colors
 
//     orientation: {
//       type:    String,
//       enum:    ["landscape","portrait","square"],
//       default: "landscape",
//     },
 
//     // ── Pricing ────────────────────────────────────────────────────────────────
//     licenses: { type: [licenseSchema], default: [] },
 
//     // ── Status ────────────────────────────────────────────────────────────────
//     status: {
//       type:    String,
//       enum:    ["pending","approved","rejected","flagged"],
//       default: "pending",
//       index:   true,
//     },
//     isFree:       { type: Boolean, default: false },  // free with attribution
//     isFeatured:   { type: Boolean, default: false },  // pinned by admin to trending
//     rejectionNote:{ type: String,  default: "" },
 
//     // ── Stats ─────────────────────────────────────────────────────────────────
//     totalDownloads: { type: Number, default: 0 },
//     totalRevenue:   { type: Number, default: 0 },  // in paise
//     viewCount:      { type: Number, default: 0 },
//     saveCount:      { type: Number, default: 0 },
 
//     // ── Brief link ────────────────────────────────────────────────────────────
//     brief: {
//       type:    mongoose.Schema.Types.ObjectId,
//       ref:     "Brief",
//       default: null,
//     },
//   },
//   { timestamps: true }
// );


// // ── Text search index ─────────────────────────────────────────────────────────
// imageSchema.index({ title: "text", description: "text", tags: "text", useCases: "text" });
// imageSchema.index({ status: 1, niche: 1, createdAt: -1 });
// imageSchema.index({ isFeatured: 1, status: 1 });
// imageSchema.index({ contributor: 1, status: 1 });
// imageSchema.index({ accessType: 1 });

 
// const Image = mongoose.model("Image", imageSchema);
// export default Image;



import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["personal", "commercial", "extended"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    creditCost: {
      type: Number,
      required: true,
      min: 0,
    },

    platforms: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    // ── CORE ─────────────────────────────────────────────
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ── STORAGE ──────────────────────────────────────────
    cloudinary: {
      publicId: { type: String, required: true },
      originalUrl: { type: String, required: true }, // gated
      previewUrl: { type: String, required: true },  // public watermarked
      thumbnailUrl: { type: String, required: true },

      width: Number,
      height: Number,
      format: String,
      bytes: Number,
    },

    // ── TAXONOMY / SEARCH ───────────────────────────────
    niche: {
      type: String,
      enum: [
        "YouTube",
        "Podcast",
        "Notion",
        "Game Dev",
        "Newsletter",
        "Blog",
        "General",
      ],
      required: true,
      index: true,
    },

    category: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },

    useCases: {
      type: [String],
      default: [],
    },

    mood: {
      type: [String],
      default: [],
      index: true,
    },

    colors: {
      type: [String],
      default: [],
    },

    orientation: {
      type: String,
      enum: ["landscape", "portrait", "square"],
      default: "landscape",
      index: true,
    },

    // ── LICENSING (ONLY PRICING SYSTEM) ─────────────────
    licenses: {
      type: [licenseSchema],
      default: [],
    },

    isFree: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ── MODERATION ───────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "pending",
      index: true,
    },

    rejectionNote: {
      type: String,
      default: "",
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ── ANALYTICS ────────────────────────────────────────
    totalDownloads: {
      type: Number,
      default: 0,
    },

    totalRevenue: {
      type: Number,
      default: 0, // paise
    },

    viewCount: {
      type: Number,
      default: 0,
    },

    saveCount: {
      type: Number,
      default: 0,
    },

    // RELATION
    brief: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brief",
      default: null,
    },
  },
  { timestamps: true }
);


  // INDEXES (SEARCH + PERFORMANCE)


// full-text search
imageSchema.index({
  title: "text",
  description: "text",
  tags: "text",
  useCases: "text",
});

// filtering + feeds
imageSchema.index({ status: 1, niche: 1, createdAt: -1 });
imageSchema.index({ isFeatured: 1, status: 1 });
imageSchema.index({ contributor: 1, status: 1, createdAt: -1 });

// filter helpers
imageSchema.index({ category: 1, status: 1 });
imageSchema.index({ mood: 1, status: 1 });

const Image = mongoose.model("Image", imageSchema);
export default Image;