import { useParams } from "react-router-dom";
import { useGetProductById } from "../hooks/useGetProductById";
import { useEffect, useState, useMemo } from "react";
import RelatedProduct from "./RelatedProduct";
import { toast } from 'react-toastify';

const Detail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: product, isLoading, error } = useGetProductById(Number(id));
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>("red");
  const colors = [
    { name: "Red", color: "bg-red-500" },
    { name: "Blue", color: "bg-blue-500" },
    { name: "Gray", color: "bg-gray-400" },
  ];
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const relatedProductComponent = useMemo(() => {
    return product?.id ? <RelatedProduct currentProductId={product.id} /> : null;
  }, [product?.id]);
  
  // Cập nhật selectedImage khi product thay đổi
  useEffect(() => {
    if (product?.images?.length) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);
  
  useEffect(() => {
    window.scrollTo(0, 0); // Cuộn lên đầu trang mỗi khi id thay đổi
    setQuantity(1);
    setSelectedColor("red"); // Reset màu về mặc định
    setSelectedSize(null); // Reset size về null hoặc mặc định
  }, [id]); // Khi id thay đổi, reset lại các state

  if (isLoading) {
    return (
      <div className="min-h-[100vh] flex justify-center items-center">
        <p className="text-gray-500 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }
  if (error || !product) return <p>Product not found</p>;

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const newItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: selectedImage,
      quantity,
      color: selectedColor,
      size: selectedSize,
    };
  
    const existingItem = cart.find((item: any) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push(newItem);
    }
  
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // Hiển thị toast thay vì alert
    toast.success("Product added to cart!", {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });

    // Chờ 1 giây rồi reload trang
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
  

  return (
    <div>    
      <div className="container mx-auto py-12 grid grid-cols-1 md:grid-cols-[60%_40%] gap-10">
        {/* Left: Image Gallery */}
        <div className="flex gap-4 items-start w-full">
          {/* Ảnh nhỏ (bên trái) */}
         
          <div className="flex flex-col gap-2">
          {Array(4)
            .fill(null)
            .map((_, index) => {
              const img = product.images?.[index]; // Lấy ảnh nếu có
              return (
                <div
                  key={index}
                  className="bg-[#F5F5F5] rounded w-[170px] h-[138px] flex items-center justify-center"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`Thumbnail ${index}`}
                      className={`h-[120px] p-1 cursor-pointer ${
                        selectedImage === img ? "border-blue-500" : "border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(img)}
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
              );
            })}
        </div>

          {/* Ảnh lớn */}
          <div className="bg-[#F5F5F5] rounded w-[450px] h-[576px] w-full p-4 flex items-center justify-center">
            {selectedImage && (
              <img src={selectedImage} alt={product.name} className="w-full h-full object-contain" />
            )}
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="w-full ml-auto">
          <h1 className="text-[24px] font-semibold font-[Inter]">{product.name}</h1>
          <div className="flex items-center gap-2 my-2">
            {[...Array(5)].map((_, i) => (
              i < (product.rate || 4) ? (
              <img src="/Star.svg" key={i} alt="Star" className="w-[20px] h-[20px]" />
              ) : (
              <img src="/GrayStar.svg" key={i} alt="Star" className="w-[20px] h-[20px]" />
              )
            ))}
            <span className="text-gray-500 text-[14px]">(100 Reviews)</span>
            <span className="text-gray-500 text-[14px]">
              ({product.stock || 50} in stock)
            </span>
          </div>
          <p className="text-[24px] text-black font-[Inter]">${product.price}</p>
          <p className="text-[14px] text-black my-4">{product.description}</p>
        
          {/* Colors */}
          <div className="my-4 flex items-center gap-4">
            <h3 className="text-[20px] font-[Inter]">Colours:</h3>
            <div className="flex gap-4">
              {colors.map(({ name, color }) => (
                <div
                    key={name}
                    className={`w-4 h-4 rounded-full cursor-pointer ${color}
                        ${selectedColor === name ? "border-2 border-white outline outline-2 outline-black" : "border-2 border-white"}`}
                    onClick={() => setSelectedColor(name)}
                >
                </div>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="my-4 flex items-center gap-4">
            <h3 className="text-[20px] font-[Inter]">Size:</h3>
            <div className="flex gap-2">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <button
                key={size}
                className={`w-[32px] h-[32px] items-center justify-center text-[14px] border border-gray-400 rounded ${
                    selectedSize === size ? "bg-red-500 text-white border border-red-500" : ""
                }`} onClick={() => setSelectedSize(size)}>
                    {size}
                    </button>
                ))}
            </div>
          </div>

          {/* Quantity and Buy Now */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex border border-gray-400 w-[159px] h-[44px] items-center rounded">
              <button className="flex items-center justify-center text-black w-[45px] h-[40px]" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>-</button>
              <span className="flex items-center justify-center text-center w-[69px] h-[44px] text-[20px] border border-gray-400">
                {quantity}
              </span>
              <button className="flex items-center justify-center text-black w-[45px] h-[40px]" onClick={() => setQuantity((prev) => prev + 1)}>+</button>
            </div>

            <button onClick={handleAddToCart} className="bg-red-500 text-white w-[165px] h-[44px] flex items-center justify-center rounded">Buy Now</button>
            <button className="border border-gray-400 rounded w-[40px] h-[40px] flex items-center justify-center"><img src="/Wishlist2.svg" alt="Wishlist2" className="w-[32px] h-[32px]" /></button>
          </div>

          {/* Delivery Info */}
          <div className="border border-gray-400 rounded">
            <div className="p-4 flex items-start gap-3">
              <img src="/icon-delivery2.svg" alt="icon-delivery2" className="w-[40px] h-[40px] object-contain" />
              <div>
                <h3 className="font-medium text-[16px]">Free Delivery</h3>
                <button className="font-medium text-[12px] text-black hover:border-b hover:border-black">
                  Enter your postal code for Delivery Availability
                </button>
              </div>
            </div>

            <div className="border-t border-t-gray-400 p-4 flex items-start gap-3">
              <img src="/Icon-return.svg" alt="Icon-return" className="w-[40px] h-[40px] object-contain" />
              <div>
                <h3 className="font-medium text-[16px]">Return Delivery</h3>
                <span className="font-medium text-[12px] text-black mr-1">Free 30 Days Delivery Returns.</span>
                <button className="font-medium text-[12px] text-black hover:border-b hover:border-black">
                  Details
                </button>
              </div>
            </div>

          </div>
        
        </div>
      </div>
      {/* OurProduct Component */}
      <div className="mt-5 mb-10">{relatedProductComponent}</div>

    </div>

  );
};

export default Detail;