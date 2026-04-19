import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import { config } from "dotenv";

config();

export { cloudinary }; 

export const connectCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Storage for full-resolution images (uploaded by contributors)
export const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nichepix/images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],

    // ✔ keep optimization only (valid)
    transformation: [{ quality: "auto", fetch_format: "auto" }],

    // ❌ FIX: removed invalid overlay/watermark config
    // CloudinaryStorage does NOT support overlay objects like this

    eager: [
      // Preview (800px)
      {
        width: 800,
        crop: "scale",
      },

      // Thumbnail (300px)
      {
        width: 300,
        height: 300,
        crop: "fill",
        gravity: "auto",
      },
    ],

    // ⚠️ NOTE: eager_async can delay results
    // keep it false if you want immediate availability in req.file.eager
    eager_async: true,
  },
});



// AVATAR STORAGE

export const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nichepix/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
    ],
  },
});



// MULTER EXPORTS

export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default connectCloudinary
