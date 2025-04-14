import { RouteObject, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import SignUp from "../components/SignUp";
import LogIn from "../components/LogIn";
import Detail from "../components/Detail"; // Import trang chi tiết sản phẩm
import Cart from "../components/Cart"; // Import trang giỏ hàng
import Profile from "../components/Profile"; // Import trang giỏ hàng
import Chat from "../components/Chat"; // Import trang giỏ hàng
import CheckOut from "../components/CheckOut"; // Import trang giỏ hàng
import ProductManage from "../components/ProductManage"; // Import trang giỏ hàng
import OrderManage from "../components/OrderManage"; // Import trang giỏ hàng

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return isLoggedIn && user.roles[0] === "ADMIN" ? children : <Navigate to="/login" />;
};

export const routes = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/login",
    element: <LogIn />,
  },
  {
    path: "/detail/:id", // Thêm route cho trang chi tiết sản phẩm
    element: <Detail />,
  },
  {
    path: "/cart", // Thêm route cho giỏ hàng
    element: <Cart />,
  },
  {
    path: "/profile", // Thêm route cho giỏ hàng
    element: <Profile />,
  },
  {
    path: "/chat", // Thêm route cho giỏ hàng
    element: <Chat />,
  },
  {
    path: "/checkout", // Thêm route cho giỏ hàng
    element: <CheckOut />,
  },  
  {
    path: "/productmanage",
    element: (
      <PrivateRoute>
        <ProductManage />
      </PrivateRoute>
    ),
  },
  {
    path: "/ordermanage",
    element: (
      <PrivateRoute>
        <OrderManage />
      </PrivateRoute>
    ),
  },
];
