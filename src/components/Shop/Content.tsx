import { motion } from "framer-motion";
import CartoonBox from "../Common/CartoonBox";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useSnackbar } from 'notistack';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  baseIncrease: number;
  baseCost: number;
  icon: string;
  type: ShopItemType;
  maxLevel: number;
}
// Change from string union to enum
export enum ShopItemType {
  TAP_STRENGTH = 0,
  RECOVER_SPEED = 1,
  ENERGY_LEVEL = 2
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  baseIncrease: number;
  baseCost: number;
  icon: string;
  type: ShopItemType;  // Now using the enum
  maxLevel: number;
}

// Now UserItems can be indexed by number
export type UserItems = number[];  // Simple array of numbers

export interface User {
  _id: string;
  t_id: string;
  t_name: string;
  balance: number;
  totalEarned: number;
  earnPerTap: number;
  energy: number;
  invitees: string[];
  isPremium: boolean;
  items: UserItems;
  referalLink: string;
  last_login_timestamp: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'tapStrength',
    name: 'Tap Strength',
    description: 'Increases earnings per tap by 10',
    baseIncrease: 1,
    baseCost: 5000,
    icon: '/assets/Shop/sword-icon.svg',
    type: ShopItemType.TAP_STRENGTH,  // Using enum value
    maxLevel: 10
  },
  {
    id: 'recoverSpeed',
    name: 'Recover Speed',
    description: 'Increases energy recovery speed by 1',
    baseIncrease: 1,
    baseCost: 5000,
    icon: '/assets/Shop/heart-icon.svg',
    type: ShopItemType.RECOVER_SPEED,  // Using enum value
    maxLevel: 10
  },
  {
    id: 'energyLevel',
    name: 'Energy Level',
    description: 'Increases max energy by 500',
    baseIncrease: 500,
    baseCost: 5000,
    icon: '/assets/Shop/shield-icon.svg',
    type: ShopItemType.ENERGY_LEVEL,  // Using enum value
    maxLevel: 10
  }
];


const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 },
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: { scale: 1.01, transition: { duration: 0.2 } },
};

const Content: React.FC = () => {
  const { userData, setUserData } = useUser();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const calculateCost = (basePrice: number, currentLevel: number) => {
    return Math.floor(basePrice * Math.pow(1.2, currentLevel));
  };

  const getCurrentLevel = (itemType: ShopItemType): number => {
    if (!userData?.items) return 0;
    return userData.items[itemType] || 0;
  };

  // New function to get current status value
  const getCurrentStatus = (itemType: ShopItemType): string => {
    if (!userData) return '0';
    
    switch (itemType) {
      case ShopItemType.TAP_STRENGTH:
        return `${userData.earnPerTap}/tap`;
      case ShopItemType.RECOVER_SPEED:
        // Assuming base recovery is 1 and each level adds 1
        return `${1 + getCurrentLevel(ShopItemType.RECOVER_SPEED)}/sec`;
      case ShopItemType.ENERGY_LEVEL:
        // Base energy 1000 + (500 per level)
        const maxEnergy = 1000 + (getCurrentLevel(ShopItemType.ENERGY_LEVEL) * 500);
        return `${userData.energy}/${maxEnergy}`;
      default:
        return '0';
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    if (!userData) {
      enqueueSnackbar('User data not available', { variant: 'error', autoHideDuration: 3000 });
      return;
    }

    const currentLevel = getCurrentLevel(item.type);
    const cost = calculateCost(item.baseCost, currentLevel);

    if (currentLevel >= item.maxLevel) {
      enqueueSnackbar('Already at max level', { variant: 'error', autoHideDuration: 3000 });
      return;
    }

    if (userData.balance < cost) {
      enqueueSnackbar('Insufficient balance', { variant: 'error', autoHideDuration: 3000 });
      return;
    }

    setIsLoading(item.id);
    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData?.t_id,
          itemType: item.type,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to purchase item');
      }

      const data = await response.json();
      setUserData(data.user);
      enqueueSnackbar(`Successfully upgraded ${item.name}!`, { variant: 'success', autoHideDuration: 3000 });
    } catch (error) {
      enqueueSnackbar((error as Error).message || 'Failed to purchase item', { variant: 'error', autoHideDuration: 3000 });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <motion.div
      className="relative h-[calc(100vh-6rem)] bg-[#1B2F31] mx-8 my-4 border-2 border-black shadow-lg text-white overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header section remains the same */}
      {/* Header */}
      <div className="sm:mb-6 p-4">
        <div className="mb-4 flex items-center gap-x-2">
          <Image src="/assets/Shop/shop-icon.svg" alt="Shop Icon" width={32} height={32} className="sm:w-12 sm:h-12" />
          <div className="flex flex-col">
            <h1 className="text-md sm:text-2xl font-semibold">Shop</h1>
            <p className="text-xs sm:text-md text-gray-400">Upgrade your tapping power</p>
          </div>
        </div>

        {/* Balance display */}
        <div className="flex gap-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="w-full cursor-pointer transition-transform"
          >
            <CartoonBox
              height={"2rem"}
              backgroundColor="#EA443B"
              borderColor="#000000"
              contentClass="flex items-center ml-4"
            >
              <Image src="/assets/Shop/coin-icon.svg" alt="Coin Icon" width={20} height={20} className="mr-1" />
              <span className="text-sm sm:text-lg font-normal">{userData?.balance || 0}pts</span>
            </CartoonBox>
          </motion.div>
        </div>
      </div>
      
      <motion.div
        className="overflow-y-auto scrollable max-h-full pb-32 sm:pb-36 md:pb-40 p-4 flex flex-col space-y-6"
        variants={containerVariants}
      >
        {SHOP_ITEMS.map((item) => {
          const currentLevel = getCurrentLevel(item.type);
          const cost = calculateCost(item.baseCost, currentLevel);
          const isMaxLevel = currentLevel >= item.maxLevel;
          const currentStatus = getCurrentStatus(item.type);

          return (
            <motion.div
              key={item.id}
              className="relative"
              variants={itemVariants}
              whileHover="hover"
            >
              <CartoonBox
                width="100%"
                height={"6rem"}
                backgroundColor="#335056"
                borderColor="#569CAA"
                className="cursor-pointer"
                contentClass="flex items-center p-4"
              >
                <Image
                  src={item.icon}
                  alt={`${item.name} Icon`}
                  width={80}
                  height={80}
                  className="absolute -right-3 top-2 sm:top-1/4 transform -translate-y-1/2 w-12 h-12 sm:w-20 sm:h-20"
                />

                <div className="w-full flex flex-col">
                  <div className="flex justify-between items-center pr-16">
                    <span className="text-md sm:text-lg font-normal leading-none">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-[#FAB757] leading-none mb-2">
                    {item.description}
                  </span>
                  <div className="flex items-center gap-x-2">
                    {!isMaxLevel ? (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        className={`bg-[#569CAA] flex items-center gap-x-1 px-2 py-1 transition-transform ${
                          isLoading === item.id || (userData?.balance || 0) < cost
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        onClick={() => handlePurchase(item)}
                        disabled={isLoading === item.id || (userData?.balance || 0) < cost}
                      >
                        <span className="font-light text-sm">
                          {isLoading === item.id ? 'Buying...' : `BUY (${cost}pts)`}
                        </span>
                        <Image
                          src="/assets/Shop/get-more-icon.svg"
                          alt="Get More Icon"
                          width={16}
                          height={16}
                        />
                      </motion.button>
                    ) : (
                      <motion.button
                        className="bg-[#516A6F] flex items-center gap-x-1 px-2 py-1"
                        disabled
                      >
                        <span className="font-light text-sm text-gray-300">
                          MAX LEVEL
                        </span>
                      </motion.button>
                    )}
                    <motion.button
                      className="bg-[#516A6F] flex items-center gap-x-1 px-2 py-1"
                    >
                      <span className="font-light text-sm text-gray-300">
                        Level {currentLevel}/{item.maxLevel}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </CartoonBox>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
};

export default Content;