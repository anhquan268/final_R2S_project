import { useGetAllProducts, Product } from "../hooks/useGetAllProducts";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

interface OurProductProps {
    currentProductId: number;
}

const RelatedProduct = ({ currentProductId }: OurProductProps) => {
  const { data: products, isLoading, error } = useGetAllProducts();
  const navigate = useNavigate();

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    const existingItem = cart.find((item: any) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1; // Tăng số lượng nếu sản phẩm đã có trong giỏ hàng
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

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading products</p>;

  // ✅ Kiểm tra nếu `products` không phải là mảng
  if (!Array.isArray(products)) {
    return <p>No products available</p>;
  }
  const getRandomProducts = (currentId: number) => {
    return products
      .filter((p) => p.id !== currentId) // Loại bỏ sản phẩm hiện tại
      .sort(() => Math.random() - 0.5) // Trộn ngẫu nhiên
      .slice(0, 4); // Chọn 4 sản phẩm
  };
  
  const relatedProducts = getRandomProducts(currentProductId);

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-[20px] h-[40px] rounded bg-red-500"></div>
        <span className="text-[16px] text-red-500 font-semibold font-[Inter]">Related Item</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-h-[100px]">
        {relatedProducts.map((product: Product) => (
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
                <img src="/R2S-Client/Heart.svg" alt="Heart" className="w-[34px] h-[34px] cursor-pointer" />
                <img src="/R2S-Client/Eye.svg" alt="Eye" className="w-[34px] h-[34px] cursor-pointer" />
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
                    <img src="/R2S-Client/Star.svg" key={i} alt="Star" className="w-[20px] h-[20px]" />
                  ) : (
                    <img src="/R2S-Client/GrayStar.svg" key={i} alt="Star" className="w-[20px] h-[20px]" />
                  )
                ))}
                <span className="text-gray-500 text-[14px] font-medium">
                  ({product.stock || 50})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>      
    </div>
  );
};


export default RelatedProduct;