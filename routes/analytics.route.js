import express from "express";
import { adminRoute, productRoute } from "../middleware/auth.middleware.js";
import { getAnalyticsData, getDailySaleData } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/",productRoute, adminRoute, async (req,res) => {
    try{
        const analyticsData = await getAnalyticsData();
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() -7*24*60*60*1000);
        const dailySaleData = await getDailySaleData(startDate, endDate);

        res.json({
            analyticsData,
            dailySaleData
        })
    }catch(error){
        console.log("Error in analytics route,", error.message);
        res.status(500).json({message: "Internal server error",error:error.message});
    }
});

export default router;