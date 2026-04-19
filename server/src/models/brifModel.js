import mongoose from "mongoose";

const briefSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    niche: {
      type:     String,
      enum:     ["YouTube","Podcast","Notion","Game Dev","Newsletter","Blog","General"],
      required: true,
    },
    requiredTags:    { type: [String], default: [] },
    requiredMoods:   { type: [String], default: [] },
    exampleImages:   { type: [String], default: [] },  // cloudinary URLs for reference

    // ── Dates ─────────────────────────────────────────────────────────────────
    deadline:  { type: Date, required: true },
    status: {
      type:    String,
      enum:    ["open","closed","fulfilled"],
      default: "open",
      index:   true,
    },

    // ── Creator ───────────────────────────────────────────────────────────────
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    // ── Engagement ────────────────────────────────────────────────────────────
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    submissionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

briefSchema.index({ status: 1, niche: 1 });

const Brief = mongoose.model("Brief", briefSchema);
export default Brief;