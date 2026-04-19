import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, maxlength: 500, default: "" },
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },
    images: [
      {
        image:   { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    isPublic:   { type: Boolean, default: false },
    coverImage: { type: String, default: "" },   // cloudinary URL
    saveCount:  { type: Number, default: 0 },    // how many users saved this collection
  },
  { timestamps: true }
);

collectionSchema.index({ owner: 1, name: 1 }, { unique: true });
collectionSchema.index({ isPublic: 1, saveCount: -1 });

const Collection = mongoose.model("Collection", collectionSchema);
export default Collection;