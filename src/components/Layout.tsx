import { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-white">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto pl-4 pr-4">{children}</main>
      <Footer />
    </div>
  );
};