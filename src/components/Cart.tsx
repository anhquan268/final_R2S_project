import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const Cart = () => {
  const [cart, setCart] = useState<any[]>([]);
  const [updatedCart, setUpdatedCart] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
    setUpdatedCart(storedCart);

    // Kiểm tra vai trò ADMIN
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.roles && user.roles[0] === "ADMIN") {
        setIsAdmin(true);
      }
    }
  }, []);

  const handleRemoveItem = (id: number) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.location.reload();
  };

   // Xử lý nhập số lượng trực tiếp
  const handleQuantityInputChange = (id: number, value: string) => {
    const newQuantity = Math.max(1, parseInt(value) || 1);
    const updated = cart.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );

    setUpdatedCart(updated); // Update the displayed cart state
  };

  const handleUpdateCart = () => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("user"); // Kiểm tra đăng nhập

  const handleCheckout = () => {
    if (isLoggedIn) {
      navigate("/checkout");
    } else {
      navigate("/login");
    }
  };
  const handleClick3 = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate("/productmanage")
  }

  return (
    <><Header /><div className="container mx-auto py-12 pl-4 pr-4 lg:pl-16 lg:pr-16 xl:pl-40 xl:pr-40 2xl:pl-64 2xl:pr-64">
      <div className="flex items-center space-x-2 text-gray-500 text-[14px]">
        {isAdmin ? (
            <a href="#" onClick={handleClick3} className="hover:underline">Home</a>
          ) : (
            <a href="/R2S-Client/" className="hover:underline">Home</a>
        )}
        <img src="/R2S-Client/CrossLine.svg" alt="CrossLine" className="w-[7px]" />
        <span className="font-normal text-black">Cart</span>
      </div>
      <div>
        <div className="mt-10">
          <div className="w-full">
            <table className="min-w-full border-separate border-spacing-y-4">
              <thead className="shadow-md rounded">
                <tr>
                  <th className="p-4 text-[13px] sm:text-[16px]">Product</th>
                  <th className="p-4 text-left text-[13px] sm:text-[16px]">Price</th>
                  <th className="p-4 text-left text-[13px] sm:text-[16px]">Quantity</th>
                  <th className="p-4 text-left text-[13px] sm:text-[16px]">Subtotal</th>
                  <th className="p-4 text-[13px] sm:text-[16px]">Action</th>
                </tr>
              </thead>
              <tbody>
                {updatedCart.length > 0 ? (updatedCart.map((item) => (
                  <tr key={item.id} className="shadow-md rounded">
                    <td className="p-4 sm:flex items-center gap-2 text-[13px] sm:text-[16px]">
                      <img src={item.image} alt={item.name} className="hidden sm:flex w-16 h-16" />
                      {item.name}
                    </td>
                    <td className="p-2 text-[13px] sm:text-[16px]">${item.price}</td>
                    <td className="p-4 text-left">
                      <div className="flex items-left gap-2">
                        {/* Input để nhập số lượng */}
                        <input
                          type="number"
                          className="w-14 h-10 text-center rounded-lg text-[13px] sm:text-[16px]"
                          value={item.quantity}
                          onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                          min="1" />
                      </div>

                    </td>

                    <td className="p-4 text-[13px] sm:text-[16px]">${(item.price * item.quantity).toFixed(2)}</td>
                    <td className="p-2 text-center">
                      <button
                        className="text-[13px] sm:text-[16px] text-red-500 hover:underline"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
                ) : (
                  <tr className="shadow-md rounded">
                    <td className="p-4 flex items-center gap-2 text-[13px] sm:text-[16px]">
                      Your cart is empty.
                    </td>
                    <td className="p-4 text-[13px] sm:text-[16px]">$0</td>
                    <td className="p-4 text-[13px] sm:text-[16px]">
                      <input
                        type="number"
                        value={0}
                        className="w-16 border border-gray-300 p-1 text-center text-[13px] sm:text-[16px]"
                        min="1"
                        readOnly />
                    </td>
                    <td className="p-4 text-[13px] sm:text-[16px]">$0</td>
                    <td className="p-4 text-center">
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>
          <div className="flex justify-between mt-6">
            {isAdmin ? (
              <a href="#" onClick={handleClick3} className="px-4 py-2 bg-gray-200 text-black rounded text-[16px]">Return To Shop</a>
            ) : (
              <a href="/R2S-Client/" className="px-4 py-2 bg-gray-200 text-black rounded text-[16px]">Return To Shop</a>
            )}
            {cart.length > 0 && (
              <button className="px-4 py-2 bg-red-500 text-white rounded text-[16px]" onClick={handleUpdateCart}>
                Update Cart
              </button>
            )}
          </div>
        </div>
      </div>
      {cart.length > 0 && (
        <div className="grid grid-cols-[40%_60%] md:grid-cols-[60%_40%] lg:gap-10 mt-10">
          <div className="justify-between">

            <div className="flex flex-col sm:flex-col md:flex-row">
              <input
                type="text"
                placeholder="Coupon Code"
                className="border border-black px-4 py-2 max-w-[150px] md:max-w-[250px] h-[56px] text-gray-500 text-[14px] md:text-[16px] rounded" />
              <button className="mt-4 md:mt-0 bg-red-500 text-white px-6 py-2 md:mx-4 text-[14px] md:text-[16px] max-w-[150px] lg:w-[211px] h-[56px] rounded">
                Apply Coupon
              </button>
            </div>
          </div>

          <div className="border border-black p-6 rounded w-full lg:w-[319px] xl:w-[345px] 2xl:w-[364px]">
            <h2 className="text-[20px] font-medium mb-4">Cart Total</h2>
            <div className="flex justify-between mb-4 text-[14px] md:text-[16px] border-b border-gray-400">
              <span>Subtotal:</span>
              <span>${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4 text-[14px] md:text-[16px] border-b border-gray-400">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-[14px] md:text-[16px]">
              <span>Total:</span>
              <span>${cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-center">
              <button
              onClick={handleCheckout}
              className="w-full mt-4 w-full xl:w-[242px] h-[56px] bg-red-500 text-white rounded">
              Proceed to checkout
              </button>
            </div>            
          </div>
        </div>
      )}
    </div></>
  );
};

export default Cart;