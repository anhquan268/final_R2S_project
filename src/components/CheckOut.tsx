import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CheckOut = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [saveInfo, setSaveInfo] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);

    // Lấy dữ liệu người dùng đã lưu trước đó
    const savedData = JSON.parse(localStorage.getItem("checkoutInfo") || "{}");
    if (Object.keys(savedData).length > 0) {
      reset(savedData);
      setSaveInfo(true);
    }

    // Kiểm tra vai trò ADMIN
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.roles && user.roles[0] === "ADMIN") {
        setIsAdmin(true);
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const order = {
        userId: storedUser.id, // Giả sử userId là 1, cần lấy từ context/auth
        name: data.fullName,
        address: data.stAddress + ", " + data.townCity, // Thay đổi theo địa chỉ thực tế
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      };
      const token = localStorage.getItem("accessToken"); // Lấy token từ localStorage
      console.log("Token:", token);
      if (!token) {
        toast.error("You need to log in first!");
        return;
      }

      const response = await fetch("https://devapi.uniscore.vn/uri/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Thêm token vào header
        },
        body: JSON.stringify(order),
      });
      

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      toast.success("Order placed successfully!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      setCart([]);
      localStorage.removeItem("cart");

      // Lưu thông tin checkout nếu người dùng chọn lưu
      if (saveInfo) {
        localStorage.setItem("checkoutInfo", JSON.stringify(data));
      } else {
        localStorage.removeItem("checkoutInfo");
      }

      navigate("/cart");

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="flex items-center space-x-2 text-gray-500 text-[14px] mb-8">
        <a href={isAdmin ? "/productmanage" : "/"} className="hover:underline">Home</a>
        <img src="/CrossLine.svg" alt="CrossLine" className="w-[7px]" />
        <a href="/cart" className="hover:underline">Cart</a>
        <img src="/CrossLine.svg" alt="CrossLine" className="w-[7px]" />
        <span className="font-normal text-black">CheckOut</span>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">            

      <div className="sm:grid grid-cols-2 gap-10 lg:ml-14 ml-4 mr-4 xl:ml-32">
        <div>
          <h2 className="text-[36px] font-medium mb-6 font-[Inter]">Billing Details</h2>
          <div className="flex flex-col text-[15px] sm:text-[16px] font-[Poppins]">
            <label>Full Name<a className="text-red-500">*</a></label>
            <input {...register("fullName", { required: "Full Name is required" })} className="rounded bg-[#F5F5F5] p-2 w-full sm:max-w-[470px] mt-2" />
            {errors.fullName && <p className="text-red-500 text-sm">{typeof errors.fullName?.message === 'string' ? errors.fullName.message : ""}</p>}
          </div>
          <div className="flex flex-col text-[15px] sm:text-[16px] font-[Poppins] mt-4">
              <label>Company Name</label>
              <input {...register("companyName")} className="rounded bg-[#F5F5F5] p-2 w-full sm:max-w-[470px] mt-2" />
          </div>
          <div className="flex flex-col text-[15px] sm:text-[16px] font-[Poppins] mt-4">
              <label>Street Address<a className="text-red-500">*</a></label>
              <input {...register("stAddress", { required: "Street Address is required" })} className="rounded bg-[#F5F5F5] p-2 w-full sm:max-w-[470px] mt-2" />
              {errors.stAddress && <p className="text-red-500 text-sm">{typeof errors.stAddress?.message === 'string' ? errors.stAddress.message : ""}</p>}
          </div>
          <div className="flex flex-col text-[15px] sm:text-[16px] font-[Poppins] mt-4">
              <label>Apartment, floor, etc. (optional)</label>
              <input {...register("apartment")} className="rounded bg-[#F5F5F5] p-2 w-full sm:max-w-[470px] mt-2" />
          </div>
          <div className="flex flex-col text-[15px] sm:text-[16px] font-[Poppins] mt-4">
              <label>Town/City<a className="text-red-500">*</a></label>
              <input {...register("townCity", { required: "Town or City is required" })} className="rounded bg-[#F5F5F5] p-2 w-full sm:max-w-[470px] mt-2" />
              {errors.townCity && <p className="text-red-500 text-sm">{typeof errors.townCity?.message === 'string' ? errors.townCity.message : ""}</p>}
          </div>
          <div className="flex flex-col text-[15px] sm:text-[16px] font-[Poppins] mt-4">
              <label>Phone Number<a className="text-red-500">*</a></label>
              <input {...register("phone", { required: "Phone number is required", pattern: { value: /^[0-9]{10}$/, message: "Enter a valid 10-digit phone number" } })} className="rounded bg-[#F5F5F5] p-2 w-full sm:max-w-[470px] mt-2" />
              {errors.phone && <p className="text-red-500 text-sm">{typeof errors.phone?.message === 'string' ? errors.phone.message : ""}</p>}
          </div>
          <div className="flex flex-col text-[15px] sm:text-[16px] font-[Poppins] mt-4">
              <label>Email Address<a className="text-red-500">*</a></label>
              <input {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })} className="rounded bg-[#F5F5F5] p-2 w-full sm:max-w-[470px] mt-2" />
              {errors.email && <p className="text-red-500 text-sm">{typeof errors.email?.message === 'string' ? errors.email.message : ""}</p>}
          </div>            
          <div className="flex items-center text-[15px] sm:text-[16px] font-[Poppins] mt-4">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
                className="w-6 h-6 accent-red-500 rounded-lg border-gray-400 cursor-pointer mr-2"
              />
              <label className="text-gray-700 text-[15px] sm:text-[16px] font-[Poppins]">
                Save this information for faster checkout next time
              </label>
          </div>            
        </div>
    
        <div className="rounded w-full sd:max-w-[400px] w-full mt-10 sm:mt-28">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between mb-2 text-[16px] font-[Poppins]">
              <img src={item.image} alt={item.name} className="flex sm:hidden md:flex w-32 h-32 md:w-16 md:h-16" />
              <span className="flex-1 text-left ml-4 sm:ml-0 md:ml-4">{item.name}</span>
              <span className="ml-4">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between mt-4 mb-3 pt-2 text-[16px] font-[Poppins]">
            <span>Subtotal:</span>
            <span>${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-black mb-3 pt-2 text-[16px] font-[Poppins]">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between border-t border-black  pt-2 text-[16px] font-[Poppins]">
            <span>Total:</span>
            <span>${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
          </div>
          <div className="mt-4 text-[16px] font-[Poppins]">
            <div className="flex flex-col">
              <div className="flex items-center justify-between w-full">
                <label className="flex items-center mb-4">
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={() => setPaymentMethod("bank")}
                    className="mr-2 w-5 h-5 accent-black"
                  />
                  Bank
                </label>
                <img src="/Bank.svg" alt="Bank SVG" className="sm:hidden md:flex w-full max-w-[192px] mb-4" />
              </div>
            
              <label className="flex items-center">
                <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() => setPaymentMethod("cash")}
                className="mr-2 w-5 h-5 accent-black"
                />
                Cash on delivery
              </label>
            </div>
          </div>
          <div className="mt-8 text-[16px] font-[Poppins] flex gap-4">
            <input
                type="text"
                placeholder="Coupon Code"
                className="border border-black rounded p-4 w-full max-w-[300px] h-[56px] sm:text-[12px] md:text-[16px]"
            />
            <button className="bg-red-500 border-red-500 border rounded text-white sm:text-[12px] md:text-[16px] w-full max-w-[211px] h-[56px]">
                Apply Coupon
            </button>
          </div>

          <button type="submit" className="w-full max-w-[190px] h-[56px] mt-8 bg-red-500 text-white py-2 rounded">
            Place Order
          </button>
        </div>
      </div>
      </form>

    </div>
  );
};

export default CheckOut;
