import React from "react";
import Footer from "@/components/Footer/Footer";
import { Background } from "@/components/Background/Background";

interface MenuTemplateProps {
  children: React.ReactNode;
}

const MenuTemplate: React.FC<MenuTemplateProps> = ({ children }) => {
  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden z-10">
      <Background />
      {/* Conteúdo da página */}
      <main className="flex-grow">{children}</main>
      {/* Footer fixo no final da página */}
      <Footer />
    </div>
  );
};

export default MenuTemplate;
