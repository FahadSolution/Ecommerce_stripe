// import { useEffect, useState } from "react"
// import ProductCard from "./ProductCard"
// import axios from "axios"
// import toast from "react-hot-toast"


// export default function PeopleAlsoBought(){
//     const [recommendations,setRecommendations] = useState([])

//     useEffect(()=>{
//         const fetchRecommendations = async()=>{
//             try{
//                 const res = await axios.get("/products/recommendations")
//                 setRecommendations(res.data)
//             }catch(error){
//                 toast.error(error.response.data.message || "An error occurred while fetchig recommendatons")
//             }finally{
//                 setRecommendations(false)
//             }
//         }
//         fetchRecommendations()
//     },[])

//     return <div className="mt-8">
//         <h3 className="text-2xl font-semibold text-emerald-400">
//             People also bought</h3>
//             <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-col-3">
//                 {recommendations.map((product)=>(
//                     <ProductCard key={product._id} product={product}/>
//                 ))}
//             </div>
//         </div>
// }

import { useEffect, useState } from "react"
import ProductCard from "./ProductCard"
import toast from "react-hot-toast"
import axiosInstance from "../lib/axios"

export default function PeopleAlsoBought(){
    const [recommendations, setRecommendations] = useState([])
    const [isLoading, setIsLoading] = useState(false)  // ← ADD THIS

    useEffect(()=>{
        const fetchRecommendations = async()=>{
            try{
                setIsLoading(true)
                const res = await axiosInstance.get("/products/recommendations")
                setRecommendations(Array.isArray(res.data) ? res.data : [])  // ← Ensure it's an array
            }catch(error){
                toast.error(error.response?.data?.message || "An error occurred while fetching recommendations")
                setRecommendations([])
            }finally{
                setIsLoading(false)
            }
        }
        fetchRecommendations()
    },[])

    if(isLoading) return <div className="mt-8 text-gray-300">Loading...</div>
    
    if(!recommendations || recommendations.length === 0) return null

    return <div className="mt-8">
        <h3 className="text-2xl font-semibold text-emerald-400">
            People also bought</h3>
            <div className="mst-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((product)=>(
                    <ProductCard key={product._id} product={product}/>
                ))}
            </div>
        </div>
}