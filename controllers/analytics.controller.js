import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
    try{
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const saleData = await Order.aggregate([
            {
                $group: {
                    _id:null, // it group all documents together,
                    totalSales: {$sum:1},
                    totalRevenue: {$sum:"$totalAmount"}
                }
            }
        ]);
        const {totalSales, totalRevenue} = saleData[0] || {totalSales:0, totalRevenue:0};
        return {
            users: totalUsers,
            products: totalProducts,
            totalSales,
            totalRevenue,
        }
    }catch(error){
        console.log("Error in getAnalyticsData:", error.message);
        throw error;
    }
};

export const getDailySaleData = async(startDate, endDate) => {
    try{
        const dailySaleData = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt"}},
                sales: { $sum: 1 },
                revenue: { $sum: "$totalAmount" },
            },
        },
        { $sort: { _id: 1 }},
    ]);

// example of dailySalesDate
    // [
    //     {
    //         _id: "2024-08-01",
    //         sales: 12,
    //         revenue: 1450.75
    //     }
    // ]
    const dateArray = getDatesInRange(startDate, endDate);

    return dateArray.map(date => {
        const foundData = dailySaleData.find(item => item._id === date); 
        return {
            name: date,
            sales: foundData ?.sales || 0,
            revenue: foundData ?.revenue || 0,
        }
    })
    }catch(error){
        throw error;
    }   
}

function getDatesInRange(startDate, endDate){
    const dates = [];
    let currentDate = new Date(startDate);
    while(currentDate <= endDate){
        // dates.push(currentDate.toDateString().split("T")[0]);
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}