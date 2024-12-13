// Quests.tsx
import React from "react";
import Content from "@/components/Quests/Content";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

// Effects Imports
import effectBackground from "@/assets/Quests/Background.png";
import effectTriangleWhite from "@/assets/Quests/effect-triangle-white.svg";
import effectTriangleRed from "@/assets/Quests/effect-triangle-red.svg";
import effectGridTop from "@/assets/Quests/effect-grid-top.svg";
import effectGridBot from "@/assets/Quests/effect-grid-bot.svg";

const Quests = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${effectBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      ></div>

      {/* Other Effects */}
      <img
        src={effectTriangleWhite}
        alt="Effect Triangle White"
        className="absolute -top-4/4 z-0"
      />
      <img
        src={effectGridTop}
        alt="Effect Grid Top"
        className="absolute -top-4/4 right-0 z-0"
      />
      <img
        src={effectGridBot}
        alt="Effect Grid Bottom"
        className="absolute top-3/4 right-0 z-0"
      />
      <img
        src={effectTriangleRed}
        alt="Effect Triangle Red"
        className="absolute top-1/4 right-0 z-0"
      />

      {/* Page Content */}
      <Header />
      <Content />
      <Footer />
    </div>
  );
};

export default Quests;
