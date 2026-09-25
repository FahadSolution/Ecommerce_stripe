import express from "express";
import { productRoute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";


const router = express.Router();

router.get("/",productRoute, getCoupon);
router.post("/validate",productRoute, validateCoupon);

export default router;