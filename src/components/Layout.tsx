import { ReactNode } from "react";
import Footer from "../components/Footer";

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-white">
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};