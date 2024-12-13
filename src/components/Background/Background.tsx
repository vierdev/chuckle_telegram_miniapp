import React from "react";
import Image from "next/image";

export const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* Background Image Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(/assets/Play/Background.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />

      {/* Other Effects */}
      <Image
        src="/assets/Play/effect-triangle-white.svg"
        alt="Effect Triangle White"
        width={100}
        height={100}
        className="absolute left-0 -top-1/4"
      />
      <Image
        src="/assets/Play/effect-grid-top.svg"
        alt="Effect Grid Top"
        width={100}
        height={100}
        className="absolute -top-1/4 right-0"
      />
      <Image
        src="/assets/Play/effect-grid-bot.svg"
        alt="Effect Grid Bottom"
        width={100}
        height={100}
        className="absolute top-3/4 right-0"
      />
      <Image
        src="/assets/Play/effect-triangle-red.svg"
        alt="Effect Triangle Red"
        width={100}
        height={100}
        className="absolute top-1/4 -right-12"
      />
    </div>
  );
};