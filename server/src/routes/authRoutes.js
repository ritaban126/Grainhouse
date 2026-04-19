import express from "express";
import {register, login, verifyEmail, refreshToken, forgotPassword, resetPassword, getMe, logout } from "../controllers/userController.js"
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh",          refreshToken);
router.post("/forgot-password",  forgotPassword);
router.post("/reset-password",   resetPassword);
router.get("/me",  protect, getMe);
router.post("/logout", protect, logout);

export default router;