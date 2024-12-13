// Play.tsx
'use client'
import Content from "@/components/Play/Content";
import Header from "@/components/Header/Header";
import MenuTemplate from "@/scenes/Menu";

const Play = () => {
  return (
    <MenuTemplate>
      <div className="p-2">
        <Header />
      </div>
      <Content />
    </MenuTemplate>
  );
};

export default Play;
