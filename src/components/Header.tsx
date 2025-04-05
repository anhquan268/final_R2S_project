import React, { useState, useRef, useEffect } from "react";

const Header: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  let timeoutId: NodeJS.Timeout;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user"); // Remove user data
    localStorage.removeItem("checkoutInfo");
    
    window.location.href = "/login"; // Chuyển hướng trang
    window.location.reload();
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    // Kiểm tra vai trò ADMIN
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.roles && user.roles[0] === "ADMIN") {
        setIsAdmin(true);
      }
    }
    
    // Lấy giỏ hàng từ localStorage
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(storedCart.length);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && dropdownRef.current instanceof Node && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full border-b top-0 left-0 bg-white z-50">
      {/* Banner khuyến mãi */}
      <div className="bg-black text-white flex justify-between items-center py-2 px-8 text-sm h-12 gap-x-16">
      {/* Văn bản khuyến mãi */}
      <span className="font-[Poppins] text-[14px] flex-1 text-center text-gray-300">
      Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!{" "}
          <a href="#" className="font-semibold hover:border-b-2 hover:border-white">ShopNow</a>
        </span>

        {/* Chọn ngôn ngữ */}
        <div className="flex sm:flex items-center gap-2 cursor-pointer text-gray-300">
          <span>English</span>
          <img src="/DropDown.svg" alt="Search" className="w-3.5 h-3.5 cursor-pointer" />
        </div>
      </div>

      {/* Thanh điều hướng */}
      <nav className="flex items-center justify-between max-w-7xl mx-auto p-4">
        <h1 className="text-[24px] font-bold">Exclusive</h1>

        {/* Danh mục menu */}
        <div className="hidden md:flex md:space-x-4 md:text-sm lg:text-[16px] lg:space-x-12 space-x-8 text-[16px]">
          <a href={isAdmin ? "/productmanage" : "/"} className="hover:border-b-2 hover:border-black">Home</a>
          {isAdmin ? (
            <a href="/ordermanage" className="hover:border-b-2 hover:border-black">Orders</a>
          ) : (
            <a href="#" className="hover:border-b-2 hover:border-black">About</a>
          )}
          {isLoggedIn ? (
            <a href="/chat" className="hover:border-b-2 hover:border-black">Contact</a>
          ) : (
            <a href="/login" className="hover:border-b-2 hover:border-black">Sign In</a>
          )}
          {isLoggedIn ? (
            <a href="/profile" className="hover:border-b-2 hover:border-black">Account</a>
          ) : (
            <a href="/signup" className="hover:border-b-2 hover:border-black">Sign Up</a>
          )}
        </div>


        <div className="flex items-center space-x-4">

        {/* Ô tìm kiếm */}
        <div className="flex sm:w-[243px] md:w-[195px] lg:w-[243px] xl:w-[243px] 2xl:w-[243px] items-center bg-gray-100 px-4 py-2 rounded-lg text-[12px] w-[180px] h-[38px]">
            <input
            type="text"
            placeholder="What are you looking for?"
            className="bg-transparent outline-none cursor-pointer text-[10px] sm:text-[12px] md:text-[11px] lg:text-[12px] xl:text-[12px] 2xl:text-[12px] flex-1"
            aria-label="Search"
            />
            <img src="/SearchIcon.svg" alt="Search" className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer" />
        </div>

        {/* Biểu tượng giỏ hàng và yêu thích */}
        <div className="flex items-center space-x-4 relative">
            <img src="/Wishlist.svg" alt="Favorite" className="w-[32px] h-[32px] cursor-pointer" tabIndex={0}/>
            <a href="/cart" className="relative">
              <img src="/Cart1.svg" alt="Cart" className="w-[32px] h-[32px] cursor-pointer" tabIndex={0} />
              {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
              )}
            </a>
            <div className="relative inline-block"
              onMouseEnter={() => {
                clearTimeout(timeoutId);
                setIsOpen(true);
              }}
              onMouseLeave={() => {
                timeoutId = setTimeout(() => setIsOpen(false), 200); // Trì hoãn 1 giây trước khi đóng
              }}
            >              
              <a href={isLoggedIn ? "/profile" : "/login"} className="flex items-center">
              <img
                src={isLoggedIn ? "/userlogged.svg" : "/user.svg"}
                alt="User"
                className="w-[32px] h-[32px] cursor-pointer"
              />               
              </a>
              {isLoggedIn && isOpen && (
              <div 
              className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 border z-50"
              style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", minWidth: "200px" }}
              >
                <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                  My Profile
                </a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  My Order
                </a>
                <a href="#" className="block px-4 py-2 hover:bg-gray-100">
                  My Cancellations
                </a>               
                <a href="/login" onClick={handleLogout} className="block px-4 py-2 hover:bg-gray-100">
                  Log Out
                </a>
              </div>
              )}
            </div>
        </div>
        </div>
      </nav>
      <nav className="md:hidden flex items-center justify-center max-w-7xl mx-auto p-2">
        {/* Danh mục menu */}
        <div className="space-x-8 text-[16px]">
          <a href={isAdmin ? "/productmanage" : "/"} className="hover:border-b-2 hover:border-black">Home</a>
          {isAdmin ? (
            <a href="/ordermanage" className="hover:border-b-2 hover:border-black">Orders</a>
          ) : (
            <a href="#" className="hover:border-b-2 hover:border-black">About</a>
          )}
          {isLoggedIn ? (
            <a href="/chat" className="hover:border-b-2 hover:border-black">Contact</a>
          ) : (
            <a href="/login" className="hover:border-b-2 hover:border-black">Sign In</a>
          )}
          {isLoggedIn ? (
            <a href="/profile" className="hover:border-b-2 hover:border-black">Account</a>
          ) : (
            <a href="/signup" className="hover:border-b-2 hover:border-black">Sign Up</a>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
