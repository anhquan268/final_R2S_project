import { Product } from "../hooks/useGetAllProducts";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import axios from "axios";

const fetchProducts = async (searchTerm: string) => {
  const url = searchTerm.length > 0 
    ? `https://devapi.uniscore.vn/uri/api/products/search?name=${searchTerm}`
    : "https://devapi.uniscore.vn/uri/api/products";
  const { data } = await axios.get(url);
  return Array.isArray(data.data) ? data.data : [];
};

const OurProduct = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ["products", searchTerm],
    queryFn: () => fetchProducts(searchTerm),
  });

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  
    const existingItem = cart.find((item: any) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1,
        color: "red",
        size: null,
      };
      cart.push(newItem);
    }
  
    localStorage.setItem("cart", JSON.stringify(cart));

     // Hiển thị toast thay vì alert
    toast.success("Product added to cart!", {
      position: "top-right",
      autoClose: 1500,
    });

    // Chờ 1 giây rồi reload trang
    setTimeout(() => {
      window.location.reload();
    }, 1500);

  };
  if (!Array.isArray(products)) return <p>No products available</p>;

  return (
    <div className="mx-auto py-12 w-full px-4">
      <h2 className="text-[36px] font-semibold mb-6 font-[Inter]">Explore Our Products</h2>
      <div className="relative w-full max-w-md mb-6">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <span className="px-3">
            <img src="/SearchIcon.svg" alt="Search" className="w-4 h-4 cursor-pointer" />
          </span>

          <input 
          type="text" 
          placeholder="Search products..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(e.target.value.length > 0);
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          className="w-full p-2 outline-none"
          />
        </div>

        {showDropdown && searchTerm.length > 0 && products.length > 0 && (
        <ul className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {products.map((product: Product) => (
              <li 
                key={product.id} 
                onClick={() => {
                  setSearchTerm(product.name);
                  setShowDropdown(false);
                }}
                className="p-3 hover:bg-gray-100 cursor-pointer transition"
                >
                {product.name}
              </li>
            ))}
        </ul>
        )}
      </div>    
    
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[100px]">
        {isLoading ? (
          <p className="col-span-4 text-center">Loading...</p>
        ) : error ? (
          <p className="col-span-4 text-center text-red-500">Error loading products</p>
        ) : products.length > 0 ? (
        products.slice().sort((a, b) => a.id - b.id).map((product: Product) => (
          <div key={product.id}
          className="group rounded-lg bg-white transition duration-300 sm:w-full md:max-w-[270px] lg:max-w-[270px] xl:max-w-[270px] 2xl:max-w-[270px]"
          onClick={() => navigate(`/detail/${product.id}`)} // 👈 Navigate to detail page
          >
            {/* Image Container */}
            <div className="w-full h-[250px] bg-[#F5F5F5] flex flex-col items-center overflow-hidden rounded-md relative">
            <div className="flex-grow flex items-center justify-center">
                <img src={product.images[0]} alt={product.name} className="max-h-[180px] object-contain" />
              </div>
              <div className="absolute top-2 right-2 flex flex-col gap-2 items-center">
                <img src="/Heart.svg" alt="Heart" className="w-[34px] h-[34px] cursor-pointer" />
                <img src="/Eye.svg" alt="Eye" className="w-[34px] h-[34px] cursor-pointer" />
              </div>
              <button
              onClick={(e) => {
                e.stopPropagation(); // Ngăn việc click vào button làm navigate
                handleAddToCart(product);
              }}
              className="absolute bottom-0 left-0 w-full bg-black text-white py-3 text-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                Add To Cart
              </button>
            </div>
            <h3 className="text-[16px] font-medium mt-3">{product.name}</h3>
            <div className="flex items-center gap-3">
              <a className="text-red-500 text-[16px] font-medium">${product.price}</a>
              <div className="flex items-center gap-1">               
                {[...Array(5)].map((_, i) => (
                  i < (product.rate || 4) ? (
                    <img src="/Star.svg" key={i} alt="Star" className="w-[20px] h-[20px]" />
                  ) : (
                    <img src="/GrayStar.svg" key={i} alt="Star" className="w-[20px] h-[20px]" />
                  )
                ))}
                <span className="text-gray-500 text-[14px] font-medium">
                  ({product.stock || 50})
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-4 flex items-center justify-center">
          No products found
        </div>
      )}

      </div>
       {/* Thêm phần thông tin dịch vụ bên dưới danh sách sản phẩm */}
      <div className="flex flex-row justify-center items-center gap-6 sm:gap-4 md:gap-20 lg:gap-20 xl:gap-20 2xl:gap-20 mt-20">
        <div className="flex flex-col items-center text-center">
          <div className="w-[80px] h-[80px] flex items-center justify-center bg-gray-300 rounded-full">
            <div className="w-[58px] h-[58px] flex items-center justify-center bg-black rounded-full">
              <img src="/icon-delivery.svg" alt="Delivery" className="w-[40px] h-[40px]" />
            </div>
          </div>
          <h3 className="text-[16px] sm:text-[20px] font-semibold mt-4">FREE AND FAST DELIVERY</h3>
          <p className="text-gray-600 text-[12px] sm:text-[14px]">Free delivery for all orders over $140</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-[80px] h-[80px] flex items-center justify-center bg-gray-300 rounded-full">
            <div className="w-[58px] h-[58px] flex items-center justify-center bg-black rounded-full">
              <img src="/CustomerService.svg" alt="CService" className="w-[40px] h-[40px]" />
            </div>
          </div>
          <h3 className="text-[16px] sm:text-[20px] font-semibold mt-4">24/7 CUSTOMER SERVICE</h3>
          <p className="text-gray-600 text-[12px] sm:text-[14px]">Friendly 24/7 customer support</p>
        </div>
        <div className="flex flex-col items-center text-center">
          <div className="w-[80px] h-[80px] flex items-center justify-center bg-gray-300 rounded-full">
            <div className="w-[58px] h-[58px] flex items-center justify-center bg-black rounded-full">
              <img src="/Icon-secure.svg" alt="Icon-secure" className="w-[40px] h-[40px]" />
            </div>
          </div>
          <h3 className="text-[16px] sm:text-[20px] font-semibold mt-4">MONEY BACK GUARANTEE</h3>
          <p className="text-gray-600 text-[12px] sm:text-[14px]">We return money within 30 days</p>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 mt-10 border-t border-gray-300 pt-2"></div>
    </div>
  );
};


export default OurProduct;