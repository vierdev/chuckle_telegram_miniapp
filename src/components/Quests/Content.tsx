import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import CartoonBox from "../Common/CartoonBox";
import { useUser } from "@/contexts/UserContext";
import { useSnackbar } from "notistack";

// Define task types and data
interface Task {
  id: string;
  title: string;
  points: number;
  completed: boolean;
  type: 'telegram' | 'twitter' | 'youtube';
  url: string;
  icon: string;
}

const socialTasks: Task[] = [
  {
    id: 'telegram1',
    title: "Join Telegram Channel",
    points: 1000,
    completed: false,
    type: 'telegram',
    url: 'https://t.me/chuckleofficial',
    icon: '/assets/Quests/telegram-icon.svg'
  },
  {
    id: 'twitter1',
    title: "Follow on Twitter",
    points: 1000,
    completed: false,
    type: 'twitter',
    url: 'https://x.com/chucklememecoin',
    icon: '/assets/Quests/twitter.png'
  },
  {
    id: 'youtube1',
    title: "Subscribe to YouTube",
    points: 1000,
    completed: false,
    type: 'youtube',
    url: 'https://www.youtube.com/@ChuckleMemeCoin',
    icon: '/assets/Quests/youtube.png'
  },
];

// Animation variants
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
};

const Content: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const { userData, setUserData } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load tasks and check completed status from database
    const loadTasks = async () => {
      if (!userData?._id) return;

      try {
        const response = await fetch(
          `/api/tasks/get-user-tasks?userId=${userData._id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (response.ok) {
          const completedTasks = await response.json();
          const updatedTasks = socialTasks.map(task => ({
            ...task,
            completed: completedTasks.some((ct: any) => ct.taskId === task.id)
          }));
          setTasks(updatedTasks);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks(socialTasks);
      }
    };

    loadTasks();
  }, [userData?._id]);

  const handleTaskClick = async (task: Task) => {
    if (task.completed || loading || !userData?._id) return;
    
    setLoading(true);
    
    // Open URL in new tab
    window.open(task.url, '_blank');

    try {
      const response = await fetch('/api/tasks/claim-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          userId: userData._id,
          points: task.points
        }),
      });

      if (response.ok) {
        // Update local state
        setTasks(prev => 
          prev.map(t => 
            t.id === task.id ? { ...t, completed: true } : t
          )
        );

        // Update user balance
        if (setUserData) {
          setUserData({
            ...userData,
            balance: (userData.balance || 0) + task.points,
            totalEarned: (userData.totalEarned || 0) + task.points
          });
        }

        enqueueSnackbar(`Task completed! Earned ${task.points} points`, {
          variant: 'success',
          anchorOrigin: { vertical: 'top', horizontal: 'center' },
          autoHideDuration: 3000
        });
      }
    } catch (error) {
      console.error('Error claiming task:', error);
      enqueueSnackbar('Failed to claim task reward', {
        variant: 'error',
        anchorOrigin: { vertical: 'top', horizontal: 'center' },
        autoHideDuration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const completedTasksCount = tasks.filter(task => task.completed).length;

  return (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-6rem)] p-4 bg-[#1B2F31] mx-8 my-4 border-2 border-black shadow-lg text-white overflow-hidden"
    >
      {/* Earnings Display */}
      <motion.div
        className="fixed top-1 -right-1 bg-[#EA443B] px-4 border-2 border-black flex items-center gap-2"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
      >
        <span>Your earnings:</span>
        <div className="flex items-center justify-center">
          <Image
            src="/assets/Quests/bullseye.svg"
            alt="Points Icon"
            width={20}
            height={20}
          />
          <span className="font-medium tabular-nums text-md sm:text-lg">
            {userData?.balance || 0}pts
          </span>
        </div>
      </motion.div>

      {/* Header Section */}
      <div className="mb-2 sm:mb-4 flex items-center gap-x-2">
        <Image
          src="/assets/Quests/bolt-icon.svg"
          alt="Lightning Icon"
          width={32}
          height={48}
          className="h-8 sm:h-12 w-auto"
        />
        <div className="flex flex-col">
          <h1 className="text-md sm:text-2xl font-semibold flex items-center gap-2">
            Quests
          </h1>
          <p className="text-xs sm:text-md text-gray-400">
            Complete tasks and do daily logs for rewards
          </p>
        </div>
      </div>


      <div className="mb-1 sm:mb-4">
        <h2 className="text-sm font-normal text-gray-400 leading-none">
          Daily Login:
        </h2>
        <div className="flex items-center justify-between gap-2 mt-1 sm:mt-2">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
            <div
              key={index}
              className={`h-8 sm:h-10 w-10 flex items-center justify-center border-2 border-black ${
                index === 0
                  ? "bg-[#569CAA]"
                  : index === 1
                  ? "bg-[#A7C4CA]"
                  : "bg-[#3D4E50]"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center">
                {index === 0 ? (
                  <Image
                    src="/assets/Quests/calendar-icon.svg"
                    alt="Calendar Icon"
                    width={20}
                    height={20}
                  />
                ) : (
                  <span
                    className={`text-sm sm:text-xl ${
                      index !== 0 && index !== 1 ? "text-white/30" : ""
                    }`}
                  >
                    {day}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <CartoonBox
          backgroundColor="#569CAA"
          borderColor="#569CAA"
          className="mt-2 sm:mt-4 text-center text-sm sm:text-xl sm:py-1 cursor-pointer tabular-nums"
        >
          Check in 10,000pts
        </CartoonBox>
      </div>
      {/* Tasks Section */}
      <div className="w-full flex items-center justify-between">
        <h2 className="text-sm sm:text-lg font-normal mb-1">Tasks:</h2>
        <span className="text-sm sm:text-lg font-normal mb-1">
          {completedTasksCount}/{tasks.length}
        </span>
      </div>

      {/* Task List */}
      <motion.div
        className="overflow-y-auto scrollable max-h-full pb-40 sm:pb-36 md:pb-60 flex flex-col space-y-2"
        variants={listVariants}
        initial="hidden"
        animate="show"
      >
        <div className="space-y-2 sm:space-y-4">
          {tasks.map((task) => (
            <motion.div key={task.id} className="flex" variants={itemVariants}>
              <CartoonBox
                width="100%"
                backgroundColor="#335056"
                borderColor="#569CAA"
              >
                <div className="flex items-center justify-between p-2">
                  <div className="w-full flex items-center gap-4">
                    <CartoonBox
                      backgroundColor="#1FBCFF"
                      borderColor="transparent"
                      shadowType="transparent"
                      className="w-full"
                    >
                      <Image
                        src={task.icon}
                        alt={`${task.type} Icon`}
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 p-1 sm:p-2"
                      />
                    </CartoonBox>
                    <div className={task.completed ? "opacity-50" : "opacity-100"}>
                      <h3 className="text-xs sm:text-md font-medium">
                        {task.title}
                      </h3>
                      <span className="text-xs sm:text-md text-[#FAB757]">
                        {task.points}pts
                      </span>
                    </div>
                  </div>
                  <div className="w-14 flex justify-end">
                    <div
                      className={`h-8 sm:h-10 flex items-center justify-center bg-[#569CAA] ${
                        task.completed ? "w-8 sm:w-10" : "w-10 sm:w-14"
                      }`}
                      onClick={() => !task.completed && handleTaskClick(task)}
                    >
                      {task.completed ? (
                        <Image
                          src="/assets/Quests/check-icon.svg"
                          alt="Check Icon"
                          width={20}
                          height={20}
                          className="opacity-50"
                        />
                      ) : (
                        <div className="flex items-center gap-x-1 cursor-pointer">
                          <span className="text-sm sm:text-xl sm:mt-1">
                            {loading ? '...' : 'GO'}
                          </span>
                          <Image
                            src="/assets/Quests/go-icon.svg"
                            alt="Go Icon"
                            width={20}
                            height={20}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CartoonBox>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Content;
