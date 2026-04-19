import express from "express";
import {deleteImage, uploadImage,downloadImage, getImageById, getImages, getTrending, toggleSave, updateImage} from "../controllers/imageController.js"
import { optionalAuth, protect, restrictTo } from "../middleware/authMiddleware.js";
import { uploadImage as multerUpload } from "../config/cloudinary.js";

const router = express.Router();

//public
router.get("/",         optionalAuth, getImages);
router.get("/trending", getTrending);
router.get("/:id",      optionalAuth, getImageById);

// Authenticated
router.get("/:id/download", protect, downloadImage);
router.post("/:id/save",    protect, toggleSave);

// Contributors + admin
router.post(
  "/",
  protect,
  restrictTo("contributor"),
  multerUpload.single("image"),
  uploadImage
);
router.patch("/:id", protect, restrictTo("contributor"), updateImage);
router.delete("/:id", protect, restrictTo("contributor"), deleteImage);

export default router;