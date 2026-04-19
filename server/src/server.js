import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"

import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";

import authRoutes from "./routes/authRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import contributorRoutes from "./routes/contributorRoutes.js";
import briefRoutes from "./routes/briefRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import paymentWebhookRouter from "./routes/paymentWebhookRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// DB + Cloudinary
connectDB();
connectCloudinary();

// Webhook MUST come before json parser
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhookRouter
);

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/contributors", contributorRoutes);
app.use("/api/briefs", briefRoutes);
app.use("/api/collections", collectionRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(port, () => {
  console.log("Server started on PORT:", port);
});