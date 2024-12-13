import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import CartoonBox from "../Common/CartoonBox";

interface MenuItem {
  name: string;
  path: string;
  icon: string;
}

// Variants for menu item animations
const itemVariants = {
  inactive: { scale: 1, opacity: 0.5 },
  active: { scale: 1.1, opacity: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.2, transition: { duration: 0.2 } },
};

const Footer: React.FC = () => {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { name: "QUESTS", path: "/quests", icon: "/assets/Menubar/quests-icon.svg" },
    { name: "LEADERBOARD", path: "/leaderboard", icon: "/assets/Menubar/leaderboard-icon.svg" },
    { name: "PLAY", path: "/play", icon: "/assets/Menubar/play-icon.svg" },
    { name: "SHOP", path: "/shop", icon: "/assets/Menubar/shop-icon.svg" },
    { name: "PROFILE", path: "/profile", icon: "/assets/Menubar/profile-icon.svg" },
  ];

  return (
    <motion.div
      className="h-16 flex justify-around bg-transparent py-4 backdrop-blur-md"
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {menuItems.map((item) => {
        const isActive =
          pathname === item.path ||
          (item.path === "/" && pathname === "/");

        return (
          <motion.div
            key={item.name}
            className="w-[120%] flex justify-center"
            variants={itemVariants}
            initial="inactive"
            animate={isActive ? "active" : "inactive"}
            whileHover="hover"
          >
            <Link href={item.path} className="flex items-center justify-center">
              <CartoonBox
                width="100%"
                height="60px"
                backgroundColor={isActive ? "#EA443B" : "transparent"}
                borderColor="transparent"
                shadowColor={isActive ? "rgba(0, 0, 0, 0.5)" : "transparent"}
                hasShadow={isActive}
                tilted
                hoverAnimation
                className="min-w-16"
                contentClass="flex"
              >
                <div
                  className={`w-full h-full flex flex-col items-center justify-center uppercase ${
                    isActive ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <Image src={item.icon} alt={`${item.name} icon`} width={24} height={24} />
                  <p className="text-white text-xs font-normal sm:font-semibold mt-1">
                    {item.name}
                  </p>
                </div>
              </CartoonBox>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default Footer;