import { useEffect } from "react";
import Categoryitem from "../components/Categoryitem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
    { href:"/jeans", name: "Jeans",imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZY5leOCTYeqOxgOWOVy7Nla0a3YILbuwyf55_C8VPsCFqE91X1eW-_0L7&s=10"},
    { href:"/t-shirts", name: "T-shirts",imageUrl: "https://xcdn.next.co.uk/Common/Items/Default/Default/ItemImages/3_4Ratio/SearchINT/Lge/AJ5066.jpg?im=Resize,width=450"},
    { href:"/shoes", name: "Shoes",imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyZQXbzo8M0pitNS2qeKVy6zp9N2CCfLfralNRBRb_ng&s=10"},
    { href:"/glasses", name: "Glasses",imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw0396MTh59i3dZyucxrf9vrfCOq4dyqwEiLUHn6NX8TvWTyRQv7piBfZE&s=10"},
    { href:"/jackets", name: "Jackets",imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIQ_OYwEyHTmPkS_zjRvycDQuVm5U7TqUZQq-SQ405NkWUXCbVTq4vFqM&s=10"},
    { href:"/suits", name: "Suits",imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9dTeHLcsjxuAzW089_vwzuzA-wiC9Vt751_O34_vmSu2e3VvZg7mZFBGe&s=10"},
    { href:"/bags", name: "Bags",imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSByrUtm98z6iGWQLJHVYmLqofosXDb3r5c_msH62RtZjudQDE_eS1wzw8&s=10"},
];

export default function HomePage(){
    const { fetchFeaturedProducts,products,isLoading} = useProductStore();

    useEffect(()=>{
        fetchFeaturedProducts();
    },[fetchFeaturedProducts]);

    return(
        <div className="relative min-h-screen text-white overflow-hidden">
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h1 className="text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4">
                    Explore Our Categories</h1>
                    <p className="text-center text-xl text-gray-300 mb-12" >
                        Discover the latest trends in eco-friendly fashion
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map(category => (
                            <Categoryitem
                            category={category}
                            key={category.name}
                            />
                        ))}
                    </div>
                    {isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products}/>}
            </div>
        </div>
    )
}