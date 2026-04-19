import express from "express";
import {buyCreditPack, createCheckout, getMyOrders, spendCredits,} from "../controllers/paymentController.js"

import { protect, restrictTo } from "../middleware/authMiddleware.js";
 
const router = express.Router();
 
router.post("/checkout",          protect, createCheckout);
router.post("/credits/checkout",  protect, buyCreditPack);
router.post("/spend-credits",     protect, spendCredits);
router.get("/orders",             protect, getMyOrders);
// router.post("/refund/:orderId",   protect, restrictTo("admin"), refundOrder);
 
export default router;