import express from "express";
import { productRoute } from "../middleware/auth.middleware.js";
import { checkoutSession, createCheckoutSession } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session",productRoute,createCheckoutSession);
router.post("/checkout-success",productRoute,checkoutSession);

export default router;