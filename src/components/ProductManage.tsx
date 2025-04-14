import { Product } from "../hooks/useGetAllProducts";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Header from "../components/Header";

const fetchProducts = async (searchTerm: string) => {
  const url = searchTerm
    ? `https://devapi.uniscore.vn/uri/api/products/search?name=${searchTerm}`
    : "https://devapi.uniscore.vn/uri/api/products";
  const { data } = await axios.get(url);
  return Array.isArray(data.data) ? data.data : [];
};

const ProductManage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
    
  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ["products", searchTerm],
    queryFn: () => fetchProducts(searchTerm),
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [creatingProduct, setCreatingProduct] = useState<Product | null>(null);
  const defaultProduct: Product = {
    id: 0,
    name: "",
    price: 0,
    description: "",
    images: [],
    category: "",
    brand: "",
    stock: 0,
    rate: 0,
    is_active: true
  };

  const handleAddToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1,
        color: "red",
        size: null,
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Product added to cart!", { position: "top-right", autoClose: 1500 });
    setTimeout(() => window.location.reload(), 1500);
  };
  

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };
  const handleCreateProduct = (product: Product) => {
    setCreatingProduct(product);
  };

  const [images, setImages] = useState<FileList | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(e.target.files);
    }
  };

  const [newimages, setnewImages] = useState<FileList | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setnewImages(e.target.files);
    }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
  
    const { name, price, description } = editingProduct;
    // Kiểm tra nếu có trường nào bị bỏ trống
    if (!name.trim() || !description.trim() || !price) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price.toString());
      formData.append("description", description.trim());

      if (images) {
        Array.from(images).forEach((image) => {
          formData.append("images", image);
        });
      }
      console.log("form data:", formData)
      await axios.put(
        `https://devapi.uniscore.vn/uri/api/products/${editingProduct.id}`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Product updated successfully!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setEditingProduct(null);
      refetch();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleSaveNewProduct = async () => {
    if (!creatingProduct) return;
  
    const { name, price, description, category, brand } = creatingProduct;
    // Kiểm tra nếu có trường nào bị bỏ trống
    if (!name.trim() || !description.trim() || !price || !category.trim() || !brand.trim()) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price.toString());
      formData.append("description", description.trim());
      formData.append("category", category.trim());
      formData.append("brand", brand.trim());
  
      if (newimages) {
        Array.from(newimages).forEach((image) => {
          formData.append("images", image);
        });
      }
  
      await axios.post("https://devapi.uniscore.vn/uri/api/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      toast.success("Product created successfully!", {
        position: "top-right",
        autoClose: 1500,
      });
      setCreatingProduct(null);
      refetch(); // Cập nhật danh sách sản phẩm
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    }
  };

  const handleDeleteProduct = async (id: string | number) => {
    try {
      const url = `https://devapi.uniscore.vn/uri/api/products/${id}`;
      console.log("Deleting product at:", url);
  
      const response = await fetch(`https://devapi.uniscore.vn/uri/api/products/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true }),
      });
      if (!response.ok) {
        const errorText = await response.text(); // Lấy chi tiết lỗi từ API
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
  
      toast.success("Product deleted successfully!", {autoClose: 1500});
      refetch();
    } catch (error: any) {
      toast.error("Failed to delete product!");
      console.error("Delete error:", error);
    }
  };
  
  if (!Array.isArray(products)) return <p>No products available</p>;

  return (
    <><Header /><div className="mx-auto py-12 w-full px-4 pl-4 pr-4 xl:pl-40 xl:pr-40">
      <h2 className="text-[36px] font-semibold mb-8 font-[Inter]">Manage Products</h2>
      <button className="bg-yellow-300 text-[16px] text-black px-3 py-1 rounded mb-6" onClick={() => handleCreateProduct(defaultProduct)}>
        + Create Product
      </button>

      <div className="relative w-full max-w-md mb-6">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <span className="px-3">
            <img src="/R2S-Client/SearchIcon.svg" alt="Search" className="w-4 h-4 cursor-pointer" />
          </span>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(e.target.value.length > 0);
            } }
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="w-full p-2 outline-none" />
        </div>

        {showDropdown && searchTerm.length > 0 && products.length > 0 && (
          <ul className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {products.map((product: Product) => (
              <li
                key={product.id}
                onClick={() => {
                  setSearchTerm(product.name);
                  setShowDropdown(false);
                } }
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
            >
              <div className="w-full h-[250px] bg-[#F5F5F5] flex flex-col items-center overflow-hidden rounded-md relative">
                <div className="w-full h-full flex items-center justify-center relative"
                  onMouseEnter={(e) => e.currentTarget.querySelector("button")?.classList.add("opacity-100", "translate-y-0")}
                  onMouseLeave={(e) => e.currentTarget.querySelector("button")?.classList.remove("opacity-100", "translate-y-0")}
                >
                  <img src={product.images[0]} alt={product.name} className="max-h-[180px] object-contain" />
                  <button onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  } }
                    className="absolute bottom-0 left-0 w-full bg-black text-white py-3 text-center opacity-0 translate-y-2 transition-all duration-300">
                    Add To Cart
                  </button>
                </div>
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
              <div className="flex gap-2 mt-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded" onClick={() => navigate(`/detail/${product.id}`)}>View</button>
                <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => handleEditProduct(product)}>Edit</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
              </div>
            </div>
          ))) : (
          <div className="col-span-4 flex items-center justify-center">
            No products found
          </div>
        )}
      </div>
      {editingProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Edit Product</h3>

            {/* Hiển thị ảnh hiện tại */}
            <label className="block mb-2">Current Image:</label>
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {editingProduct.images
                .filter((img) => img) // Lọc bỏ ảnh không tồn tại (undefined, null, "")
                .map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-[200px] h-[150px] object-contain border rounded-md" />
                ))}
            </div>

            {/* Upload ảnh mới */}
            <label className="block mb-2">New Image:</label>
            <input
              type="file"
              multiple
              className="border p-2 w-full mb-4"
              onChange={handleImageChange} />
            <a>Name:</a>
            <input className="border p-2 w-full mb-4 mt-2" type="text" value={editingProduct?.name || ""}
              onChange={(e) => setEditingProduct((prev) => prev ? { ...prev, name: e.target.value } : null
              )} />

            <a>Price:</a>
            <input
              className="border p-2 w-full mb-4 mt-2"
              type="number"
              value={editingProduct?.price || ""}
              min={1} // Giới hạn nhỏ nhất là 1
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value)); // Đảm bảo giá trị tối thiểu là 1
                setEditingProduct((prev) => prev ? { ...prev, price: value } : null
                );
              } } />

            <a>Description:</a>
            <input
              className="border p-2 w-full mb-4 mt-2"
              type="text" // Đổi từ number -> text
              value={editingProduct?.description || ""}
              onChange={(e) => {
                setEditingProduct((prev) => prev ? { ...prev, description: e.target.value } : null
                );
              } }
              required // Đảm bảo không để trống
            />

            <div className="flex justify-end gap-2">
              <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setEditingProduct(null)}>Cancel</button>
              <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleSaveProduct}>Save</button>
            </div>
          </div>
        </div>
      )}
      {creatingProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Create Product</h3>

            {/* Upload ảnh mới */}
            <label className="block mb-2">Image:</label>
            <input
              type="file"
              multiple
              className="border p-2 w-full mb-4"
              onChange={handleImageUpload} />
            <a>Name:</a>
            <input className="border p-2 w-full mb-4 mt-2" type="text" value={creatingProduct?.name || ""}
              onChange={(e) => setCreatingProduct((prev) => prev ? { ...prev, name: e.target.value } : null
              )} />

            <a>Price:</a>
            <input
              className="border p-2 w-full mb-4 mt-2"
              type="number"
              value={creatingProduct?.price || ""}
              min={1} // Giới hạn nhỏ nhất là 1
              onChange={(e) => {
                const value = Math.max(1, Number(e.target.value)); // Đảm bảo giá trị tối thiểu là 1
                setCreatingProduct((prev) => prev ? { ...prev, price: value } : null
                );
              } } />

            <a>Description:</a>
            <input
              className="border p-2 w-full mb-4 mt-2"
              type="text" // Đổi từ number -> text
              value={creatingProduct?.description || ""}
              onChange={(e) => {
                setCreatingProduct((prev) => prev ? { ...prev, description: e.target.value } : null
                );
              } }
              required // Đảm bảo không để trống
            />

            <a>Category:</a>
            <input
              className="border p-2 w-full mb-4 mt-2"
              type="text" // Đổi từ number -> text
              value={creatingProduct?.category || ""}
              onChange={(e) => {
                setCreatingProduct((prev) => prev ? { ...prev, category: e.target.value } : null
                );
              } }
              required // Đảm bảo không để trống
            />

            <a>Brand:</a>
            <input
              className="border p-2 w-full mb-4 mt-2"
              type="text" // Đổi từ number -> text
              value={creatingProduct?.brand || ""}
              onChange={(e) => {
                setCreatingProduct((prev) => prev ? { ...prev, brand: e.target.value } : null
                );
              } }
              required // Đảm bảo không để trống
            />

            <div className="flex justify-end gap-2">
              <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setCreatingProduct(null)}>Cancel</button>
              <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleSaveNewProduct}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div></>
  );
};

export default ProductManage;
