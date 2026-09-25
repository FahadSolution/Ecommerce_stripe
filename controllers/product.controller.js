import { v2 as cloudinary } from "cloudinary";
import { getRedis } from "../lib/redis.js";
const redis = getRedis();
import Product from "../models/product.model.js"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const getAllProducts = async (req,res)=>{
    try{
        const products = await Product.find({});  //find all products
        res.json({products});
    }catch(error){
        console.log("Error in getallProducts controller",error.message);
        res.status(500).json({message:"Server error", error: error.message});
    }
};

export const getFeaturedProducts = async (req,res)=>{
    try{
        let featuredProducts = await redis.get("featured_products");
        if(featuredProducts){
            return res.json(JSON.parse(featuredProducts));
        }

        // if not in redis, fetch from mongoDB
        //.lean() is gonna return a plain javaScript object instead of a mongoDB document
        // which is good for performance
        featuredProducts = await Product.find({isFeatured:true}).lean();
        if(!featuredProducts){
            return res.status(404).json({message:"NO featured products found"});
        }
        // store in redis for future quick access
        await redis.set("featured_products",JSON.stringify(featuredProducts));
        res.json(featuredProducts);
    }catch(error){
        console.log("Error in getFeaturedProducts controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
};

// export const createProduct = async (req,res)=>{
//      try{
//         const {name,description,price,image,category} =req.body;
//         let cloudinaryResponse = null
//         if(image){
//             cloudinaryResponse =await cloudinary.uploader.upload(image,{folder:"products"})
//         }



export const createProduct = async (req,res)=>{
     try{
        const {name,description,price,image,category} = req.body;
        
        if(!image) {
            return res.status(400).json({message: "Image is required"});
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: image, // Store base64 directly for now
            category
        });
        
        return res.status(201).json(product);
        
     }catch(error){
        console.log("Error in createProduct controller:", error.message);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        });
     }
};

export const deleteProduct = async (req,res)=>{
    try{
        const product = await Product.findById(req.params.id)

        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        if(product.image){
            const publicId =product.image.split("/").pop().split(".")[0]; // this will get the id of the image
            try{
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log("deleted image from cloudinary")
            }catch(error){
                console.log("error deleting image from cloudinary",error)
            }
        }
        await Product.findByIdAndDelete(req.params.id)
        res.json({message:"Product deleted successfully"});
    }catch(error){
        console.log("Error in deleteProduct controller",error.message)
        res.status(500).json({message: "Server error",error: error.message});
    }
};

export const getRecommendedProducts = async(req,res)=>{
    try{
        const products =await Product.aggregate([
            {
                $sample:{size:4}
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    description:1,
                    image:1,
                    price:1
                }
            }
        ])
        res.json(products)
    }catch(error){
        console.log("Error in getRecommendedProducts controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
};

export const getProductsByCategory = async(req,res)=>{
    const {category} =req.params;
    try{
        const products = await Product.find({category});
        res.json({products});
    }catch(error){
        console.log("Error in getProductsByCategory controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
};

export const toggleFeaturedProduct = async(req,res)=>{
    try{
        const product= await Product.findById(req.params.id);
        if(product){
            product.isFeatured=!product.isFeatured;
            const updatedProduct = await product.save();
            //update redis
            await updateFeaturedProductsCache();
            res.json(updatedProduct);
        }else{
            res.status(404).json({message:"Product not found"});
        }
    }catch(error){
        console.log("Error in toggleFeaturedProduct controller",error.message);
        res.status(500).json({message:"Server error",error:error.message});
    }
};

async function updateFeaturedProductsCache() {
    try{
        //the lean() method is used to return plain javaScript objects instead of full mongoose documents.This can significantly improve performance.
        const featuredProducts = await Product.find ({isFeatured:true}).lean();
        await redis.set("featured_products",JSON.stringify(featuredProducts));
    }catch(error){
        console.log("Error in update cache function");

    }
};

