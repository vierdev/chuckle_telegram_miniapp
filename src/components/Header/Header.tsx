import React from "react";
import { motion } from "framer-motion";
import CartoonBox from "../Common/CartoonBox";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";

// Animation variants remain the same...
const headerVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const boxVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// Level calculation functions
const calculateLevel = (points: number) => {
  const pointsPerLevel = 5000;
  const level = Math.floor(points / pointsPerLevel);
  return Math.min(level, 100); // Cap at level 100
};

const calculateProgress = (points: number) => {
  const pointsPerLevel = 5000;
  const currentLevel = calculateLevel(points);
  const pointsInCurrentLevel = points - (currentLevel * pointsPerLevel);
  return (pointsInCurrentLevel / pointsPerLevel) * 100;
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

const Header: React.FC = () => {
  const { userData, setUserData, mount } = useUser();
  
  // Ensure we have a default value for points
  const points = userData?.totalEarned ?? 0;
  const currentBalance = userData?.balance ?? 0;
  const level = calculateLevel(points);
  const progress = calculateProgress(points);
  
  // Calculate points needed for next level
  const pointsPerLevel = 5000;
  const nextLevelPoints = (level + 1) * pointsPerLevel;
  const pointsNeeded = nextLevelPoints - points;

  // Pre-format the points text to ensure consistency
  const pointsText = level < 100 
    ? `${formatNumber(pointsNeeded)} points to Level ${level + 1}`
    : 'Max Level Reached!';

  return (
    <motion.div
      className="h-28 flex flex-col sm:px-4 pb-0 sm:pb-4 sm:gap-y-4"
      variants={headerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Profile Section */}
      <div className="h-20 flex gap-x-6 items-center justify-center sm:justify-around">
        <Image 
          src={userData?.avatar_url || "/assets/Play/Avatar.png"}
          alt="Avatar icon" 
          className="z-10" 
          width={64} 
          height={64}
          priority
        />
        <div className="w-full max-w-xs sm:max-w-full h-16 flex flex-col z-20">
          <div className="flex justify-between items-center">
            <p className="text-lg font-normal text-white truncate">
              {userData?.t_name || 'Player'}
            </p>
            <p className="text-sm font-semibold text-white">
              Level {level}
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-500">
            {pointsText}
          </p>
          
          {/* Progress Bar */}
          <div className="w-full flex items-center justify-between gap-x-4 mt-1">
            <CartoonBox
              height="0.7rem"
              width="100%"
              shadowColor="#000"
              backgroundColor={`linear-gradient(to right, #569CAA ${progress}%, #687681 ${progress}%)`}
              tilted
            >
              <div className="relative w-full h-full">
              </div>
            </CartoonBox>
            <span className="tabular-nums whitespace-nowrap text-xs font-semibold text-gray-500">
              {Math.floor(progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Points and Energy Section */}
      <div className="w-full flex justify-between my-1 gap-x-4">
        {/* Points Box */}
        <motion.div
          variants={boxVariants}
          initial="initial"
          animate="animate"
          className="flex-1"
        >
          <CartoonBox
            width="100%"
            height="auto"
            backgroundColor="#EA443B"
            borderColor="#000"
            shadowColor="#000000"
            tilted
            className="px-2"
          >
            <div className="w-full h-full flex items-center gap-x-1">
              <Image
                src="/assets/Play/bullseye.svg"
                alt="points icon"
                width={24}
                height={24}
                className="ml-0 sm:ml-6"
              />
              <span className="text-nowrap text-sm smd:text-lg font-medium text-white">
                {formatNumber(currentBalance)} pts
              </span>
            </div>
          </CartoonBox>
        </motion.div>

        {/* Energy Box */}
        <motion.div
          variants={boxVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="flex-1"
        >
          <CartoonBox
            width="100%"
            height="auto"
            backgroundColor="#FAB757"
            borderColor="#000000"
            shadowColor="rgba(0,0,0,1)"
            tilted
          >
            <div className="relative w-full h-full flex items-center gap-x-1 mx-4 sm:mx-0">
              <Image
                src="/assets/Play/bolt.svg"
                alt="energy icon"
                width={24}
                height={24}
                className="ml-0 sm:ml-6"
              />
              <span className="text-nowrap text-sm smd:text-lg font-medium text-[#1B2F31]">
                {mount}/{(500 + (userData?.items[2] || 0) * 500)} Energy
              </span>
            </div>
          </CartoonBox>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Header;