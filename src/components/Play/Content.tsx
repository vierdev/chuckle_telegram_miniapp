import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";

// Existing variants remain the same
const containerVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
};

const effectVariants = {
  initial: { opacity: 0, scale: 0 },
  animate: {
    opacity: 1,
    scale: [0, 1.2, 1],
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const tapVariants = {
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

// New star animation variant
const starAnimationVariants = {
  initial: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 15, -15, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

const plusOneVariants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 0, y: -300, transition: { duration: 1, ease: "easeInOut" } },
};

const Content: React.FC = () => {
  const { userData, setUserData, mount, setMount } = useUser();
  const [earnings, setEarnings] = useState(0);
  const [plusOnes, setPlusOnes] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [pendingSave, setPendingSave] = useState(false);
  const [starAnimate, setStarAnimate] = useState(false);
  const accumulatedEarningsRef = useRef<number>(0);

  // Function to save to database with accumulated earnings
  const saveToDatabase = async () => {
    if (!userData || accumulatedEarningsRef.current === 0) return;
    
    try {
      const earnedAmount = accumulatedEarningsRef.current;
      const response = await fetch('/api/updateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.t_id,
          balance: userData.balance,
          totalEarned: userData.totalEarned,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save');
      }

      // Reset accumulated earnings after successful save
      accumulatedEarningsRef.current = 0;
      setPendingSave(false);
    } catch (error) {
      console.error('Error saving to database:', error);
      setPendingSave(true);
    }
  };

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToDatabase();
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save any pending changes when component unmounts
      if (accumulatedEarningsRef.current > 0) {
        saveToDatabase();
      }
    };
  }, []);

  const handleTap = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const touches = event.touches.length;
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect && userData && mount > 0) {
      setStarAnimate(true);
      setTimeout(() => setStarAnimate(false), 400);

      const x = event.touches[0].clientX - containerRect.left;
      const y = event.touches[0].clientY - containerRect.top;

      const earnedAmount = touches * (userData.earnPerTap + userData.items[0]) * 10;
      
      // Accumulate earnings
      accumulatedEarningsRef.current += earnedAmount;
      
      setEarnings((prevEarnings) => prevEarnings + earnedAmount);
      setUserData({
        ...userData,
        balance: userData.balance + earnedAmount,
        totalEarned: userData.totalEarned + earnedAmount,
      });

      setPlusOnes((prevPlusOnes) => [
        ...prevPlusOnes,
        ...Array(touches).fill(0).map((_, index) => ({
          id: Date.now() + index,
          x: x + index * 20,
          y: y,
        })),
      ]);

      const newMount = Math.max(0, mount - 1);
      setMount(newMount);

      // Set pending save flag
      setPendingSave(true);
      
      // Trigger debounced save
      debouncedSave();

      setTimeout(() => {
        setPlusOnes((prevPlusOnes) => prevPlusOnes.slice(touches));
      }, 1000);
    }
  }, [userData, setUserData, mount, setMount, debouncedSave]);

  useEffect(() => {
    return () => {
      if (pendingSave) {
        saveToDatabase();
      }
    };
  }, [pendingSave]);

  const isDisabled = mount <= 0;

  return (
    <motion.div
      className="relative h-[calc(100vh-12rem)] overflow-hidden flex items-center justify-center"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Container for Character and Effects */}
      <div
        ref={containerRef}
        className="relative w-full max-w-md flex items-center justify-center"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Existing Character Image and other elements */}
        <motion.div
          variants={tapVariants}
          whileTap="tap"
          onTouchStart={handleTap}
          className="flex cursor-pointer touch-none w-full h-full justify-center items-center"
        >
          <Image
            src="/assets/Play/Character.png"
            alt="Character"
            width={600}
            height={600}
            className="w-72 sm:w-72 md:w-full md:h-full object-contain"
            priority
          />
        </motion.div>

        {/* Existing Animated +1 effects */}
        {<AnimatePresence>
          {plusOnes.map((plusOne) => (
            <motion.div
              key={plusOne.id}
              className="absolute text-4xl font-bold text-green-500 pointer-events-none"
              style={{ left: plusOne.x, top: plusOne.y }}
              variants={plusOneVariants}
              initial="initial"
              animate="animate"
              exit="animate"
            >
              +{(1 + userData?.items[0]) * 10}
            </motion.div>
          ))}
        </AnimatePresence>}

        {/* Existing Effect Images */}
        <motion.div
          className="absolute -top-2 left-[65%] w-[15%] h-16 z-50 hidden sm:block"
          variants={effectVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Image src="/assets/Play/effect-1.svg" alt="Effect 1" fill style={{ objectFit: "contain" }} />
        </motion.div>
        <motion.div
          className="absolute top-[40%] right-[14%] w-[15%] h-8 hidden sm:block"
          variants={effectVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.6 }}
        >
          <Image src="/assets/Play/effect-2.svg" alt="Effect 2" fill style={{ objectFit: "contain" }} />
        </motion.div>
        <motion.div
          className="absolute bottom-[20%] left-[10%] w-[15%] h-16 hidden sm:block"
          variants={effectVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
        >
          <Image src="/assets/Play/effect-3.svg" alt="Effect 3" fill style={{ objectFit: "contain" }} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Content;