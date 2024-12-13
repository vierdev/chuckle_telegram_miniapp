import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import CartoonBox from "../Common/CartoonBox";
import Image from "next/image";

// Types
interface User {
  _id: { $oid: string };
  t_id: string;
  t_name: string;
  balance: number;
  totalEarned: number;
  earnPerTap: number;
  energy: number;
  invitees: string[];
  isPremium: boolean;
  items: any[];
  referalLink: string;
  last_login_timestamp: string;
  walletAddress: string;
  avatar_url: string;
}

// Variants for animations
const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

// Colors for top 3 ranks
const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

interface ContentProps {
  currentUser: User;
  leaderboard: User[];
}

const Content: React.FC<ContentProps> = ({ currentUser, leaderboard }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tableHeight, setTableHeight] = useState(0);

  // Sort users by totalEarned (descending)
  const sortedLeaderboard = [...leaderboard].sort(
    (a, b) => b.totalEarned - a.totalEarned
  );

  // Find current user's rank
  const currentUserRank = sortedLeaderboard.findIndex(
    (user) => user.t_id === currentUser.t_id
  ) + 1;

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { height } = entries[0].contentRect;
        const availableHeight = height - 200;
        setTableHeight(availableHeight);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="relative h-[calc(100vh-6rem)] p-4 bg-[#1B2F31] mx-8 my-4 border-2 border-black shadow-lg text-white overflow-hidden"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={listVariants}
    >
      {/* Leaderboard Header */}
      <div className="mb-2 sm:mb-6">
        <div className="mb-1 flex items-center gap-x-2">
          <Image
            src="/assets/Leaderboard/leaderboard-icon.svg"
            alt="Leaderboard Icon"
            width={32}
            height={32}
            className="h-8 sm:h-12 w-auto"
          />
          <div className="flex flex-col">
            <h1 className="text-md sm:text-2xl font-semibold flex items-center gap-2">
              Leaderboard
            </h1>
            <p className="text-xs sm:text-md text-gray-400">
              See where you stand
            </p>
          </div>
        </div>

        {/* Current User Item */}
        <CartoonBox
          backgroundColor="#335056"
          borderColor="#569CAA"
          className="w-full mb-4"
        >
          <div className="flex items-center justify-between p-2 sm:p-4">
            <div className="flex items-center gap-x-2 sm:gap-x-4">
              <span className="text-sm sm:text-lg">{currentUserRank}.</span>
              <div className="flex items-center gap-x-2">
                <Image
                  src={currentUser.avatar_url}
                  alt="User Avatar"
                  width={48}
                  height={48}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
                <span className="text-sm sm:text-md">
                  {currentUser.t_name} (YOU)
                </span>
              </div>
            </div>
            <span className="text-sm sm:text-md text-[#FAB757]">
              {(currentUser.totalEarned || 0).toLocaleString()}pts
            </span>
          </div>
        </CartoonBox>
      </div>

      {/* Leaderboard List */}
      <motion.div
        className="overflow-y-auto scrollable max-h-full pb-28 sm:pb-36 md:pb-40 flex flex-col space-y-2"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        {sortedLeaderboard.map((user, index) => (
          <motion.div
            key={user._id.$oid}
            className="relative"
            variants={itemVariants}
          >
            <CartoonBox
              width="100%"
              height={"3rem"}
              backgroundColor="#335056"
              borderColor={rankColors[index] || "#569CAA"}
              className="cursor-pointer"
              contentClass="flex items-center justify-between p-2 sm:p-4"
            >
              <div className="flex items-center gap-x-2 sm:gap-x-4">
                <span
                  className={`text-sm sm:text-lg ${
                    index < 3 ? "font-semibold" : "font-normal"
                  }`}
                  style={{ color: index < 3 ? rankColors[index] : "#FFFFFF" }}
                >
                  {index + 1}.
                </span>
                <div className="flex items-center gap-x-2">
                  <Image
                    src={user.avatar_url}
                    alt={`${user.t_name} Avatar`}
                    width={40}
                    height={40}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full"
                  />
                  <span className="text-sm sm:text-md">{user.t_name}</span>
                  {user.isPremium && (
                    <span className="text-xs text-yellow-400 ml-1">PRO</span>
                  )}
                </div>
              </div>
              <span className="text-sm sm:text-md text-[#FAB757]">
                {(user.totalEarned || 0).toLocaleString()}pts
              </span>
            </CartoonBox>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Content;
