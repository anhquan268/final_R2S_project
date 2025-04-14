import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";

const Profile: React.FC = () => {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    address: string;
    roles: string[];
    created_at: string;
  } | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {

    // Fetch user data from localStorage (update this if using API)
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser) {
      setUser(storedUser);
      
      // Kiểm tra vai trò ADMIN
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        if (user.roles && user.roles[0] === "ADMIN") {
          setIsAdmin(true);
        }
      }
    } else {
      navigate("/login"); // Redirect if not logged in
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user"); // Remove user data
    localStorage.removeItem("checkoutInfo");
    
    navigate("/login");
    window.location.reload();
    window.scrollTo(0, 0);
  };

  const handleClick3 = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate("/productmanage")
  }

  const handleUpdateProfile = async () => {
    if (!user) {
      toast.error("Profile data is missing!");
      return;
    }
  
    const { name, address } = user;
  
    // Kiểm tra nếu có trường nào rỗng
    if (!name || !address) {
      toast.error("One or more fields are empty.");
      return;
    }
  
    console.log("Sending update request with data:", { name, address });
  
    try {
      if (!name || name.length < 3 || !address || address.length < 3) {
        toast.error("Name and address must be at least 3 characters long.");
        return;
      }
      const response = await fetch("https://devapi.uniscore.vn/uri/api/auth/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ name, address }),
      });
    
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error:", errorData);
        toast.error(errorData.message || "Update failed! Please try again.");
        return;
      }
    
    
      toast.success("Profile updated successfully!");
    
      // Lấy user hiện tại từ localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    
      // Cập nhật chỉ các trường cần thay đổi
      const updatedUser = {
        ...storedUser,
        name,
        address,
      };
    
      // Lưu lại vào localStorage và cập nhật state
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };
  
  
  return (
    <><Header /><div className="container mx-auto py-12 pl-4 pr-4 lg:pl-20 lg:pr-20 xl:pl-40 xl:pr-40">
      <div className="flex items-center space-x-2 text-gray-500 text-[14px]">
        {isAdmin ? (
            <a href="#" onClick={handleClick3} className="hover:underline">Home</a>
          ) : (
            <a href="/R2S-Client/" className="hover:underline">Home</a>
        )}
        <img src="/R2S-Client/CrossLine.svg" alt="CrossLine" className="w-[7px]" />
        <span className="font-normal text-black">My Account</span>
      </div>
      <div className="flex min-h-screen mt-10">
        {/* Sidebar */}
        <aside className="hidden md:block w-1/3 bg-white rounded-lg">
          <h2 className="text-[14px] lg:text-[16px] font-medium mb-4">Manage My Account</h2>
          <ul className="space-y-3 ml-8">
            <li className="text-[14px] lg:text-[16px] text-gray-600 hover:text-red-500 cursor-pointer">My Profile</li>
            <li className="text-[14px] lg:text-[16px] text-gray-600 hover:text-red-500 cursor-pointer">
              Address Book
            </li>
            <li className="text-[14px] lg:text-[16px] text-gray-600 hover:text-red-500 cursor-pointer">
              My Payment Options
            </li>
          </ul>

          <h2 className="text-[14px] lg:text-[16px] font-medium mt-6 mb-4">My Orders</h2>
          <ul className="space-y-3 ml-8">
            <li className="text-[14px] lg:text-[16px] text-gray-600 hover:text-red-500 cursor-pointer">
              My Returns
            </li>
            <li className="text-[14px] lg:text-[16px] text-gray-600 hover:text-red-500 cursor-pointer">
              My Cancellations
            </li>
          </ul>

          <h2 className="text-[14px] lg:text-[16px] font-medium mt-6 mb-4">My Wishlist</h2>
          <button
            onClick={handleLogout}
            className="mt-4 bg-red-500 text-[16px] text-white py-2 px-4 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </aside>

        {/* Profile Form */}
        <div className="w-full h-full p-8 bg-white shadow-lg rounded-l md:ml-16">
          <h2 className="text-[20px] font-medium text-red-500 mb-6">Edit Your Profile</h2>

          <div className="md:grid lg:grid-cols-[1.5fr_1fr] gap-6">
            {/* First Name */}
            <div>
              <label className="block text-[16px] mb-1">Full Name<a className="text-red-500">*</a></label>
              <input
                type="text"
                value={user?.name || ""}
                onChange={(e) => setUser((prev) => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full p-2 border border-gray-300 rounded bg-white text-[16px] text-gray-600 mb-4 md:mb-0" />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center text-[16px] mb-1">
                Email
                <img src="/R2S-Client/lock.png" alt="Lock" className="w-4 h-4 ml-2 relative -translate-y-[2px]" />
              </label>
              <input
                type="email"
                value={user?.email || ""}
                className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-[16px] text-gray-600 mb-4 md:mb-0"
                disabled />
            </div>

            {/* Address */}
            <div className="col-span-2">
              <label className="block text-[16px] mb-1">Address<a className="text-red-500">*</a></label>
              <input
                type="text"
                value={user?.address || ""}
                onChange={(e) => setUser((prev) => prev ? { ...prev, address: e.target.value } : null)}
                className="w-full p-2 border border-gray-300 rounded bg-white text-[16px] text-gray-600" />
            </div>
          </div>

          {/* Password Fields */}
          <h3 className="text-[16px] mt-6 mb-4">Password Changes</h3>
          <div className="grid grid-cols-1 gap-4">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full p-2 border border-gray-300 rounded bg-white text-[16px] placeholder:text-gray-600" />
            <input
              type="password"
              placeholder="New Password"
              className="w-full p-2 border border-gray-300 rounded bg-white text-[16px] placeholder:text-gray-600" />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="w-full p-2 border border-gray-300 rounded bg-white text-[16px] placeholder:text-gray-600" />
          </div>

          {/* Buttons */}
          <div className="flex justify-end mt-6 space-x-4">
            <button
              onClick={() => {
                const storedUser = JSON.parse(localStorage.getItem("user") || "null");
                if (storedUser) {
                  setUser(storedUser);
                }
              } }
              className="px-4 py-2 text-black text-[16px]"
            >
              Cancel
            </button>

            <button onClick={handleUpdateProfile} className="px-6 py-2 bg-red-500 text-white rounded-lg text-[16px]">
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div></>

  );
};

export default Profile;