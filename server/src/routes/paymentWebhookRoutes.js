import express from "express";
import webhookHandler from "../controllers/webhookController.js";
 
const router = express.Router();
 
// express.raw() is applied in server.js BEFORE this router
router.post("/", webhookHandler);
 
export default router;