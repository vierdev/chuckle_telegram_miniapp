import React, { ReactNode, CSSProperties } from "react";

interface CartoonBoxProps {
  children: ReactNode;
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  borderColor?: string;
  shadowColor?: string;
  hasShadow?: boolean;
  shadowType?: "full" | "transparent";
  tilted?: boolean;
  hoverAnimation?: boolean;
  className?: string;
  contentClass?: string;
  onClick?: () => void; // Added onClick prop
}

const CartoonBox: React.FC<CartoonBoxProps> = ({
  children,
  width = "auto",
  height = "auto",
  backgroundColor = "#ffffff",
  borderColor = "#000000",
  shadowColor = "rgba(0, 0, 0, 0.5)",
  hasShadow = true,
  shadowType = "full",
  tilted = false,
  hoverAnimation = true,
  className = "",
  contentClass = "",
  onClick, // Added onClick prop
}) => {
  // Styles for the background div
  const backgroundStyles: CSSProperties = {
    width,
    height,
    background: backgroundColor,
    border: "2px solid",
    borderColor: borderColor,
    boxShadow: hasShadow ? `3px 3px 0px ${shadowColor}` : undefined,
    transform: tilted ? "skewX(-16deg)" : undefined,
    transition: hoverAnimation ? "transform 0.2s" : undefined,
  };

  // Styles for the content div
  const contentStyles: CSSProperties = {
    width,
    height,
  };

  // Hover effect classes
  const hoverEffectClass = hoverAnimation
    ? "hover:translate-x-[-2px] hover:translate-y-[-2px]"
    : "";

  // Tilted transform class
  const tiltedClass = tilted ? "transform skew-x-[-16deg]" : "";

  // Click effect classes
  const clickableClass = onClick ? "cursor-pointer active:translate-y-[1px]" : "";

  return (
    <div 
      className={`relative ${className} ${clickableClass}`} 
      style={{ width, height }}
      onClick={onClick} // Added onClick handler
      role={onClick ? "button" : undefined} // Added role for accessibility
      tabIndex={onClick ? 0 : undefined} // Added tabIndex for keyboard navigation
      onKeyPress={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined} // Added keyboard support
    >
      {/* Background Layer */}
      <div
        className={`absolute inset-0 ${tiltedClass} ${hoverEffectClass}`}
        style={backgroundStyles}
      />

      {/* Content Layer */}
      <div className={`relative ${contentClass}`} style={contentStyles}>
        {children}
      </div>
    </div>
  );
};

export default CartoonBox;
