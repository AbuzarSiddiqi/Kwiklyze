import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeech } from '../hooks/useSpeech';
import { useStorage } from '../hooks/useStorage';

/**
 * Dream Mode - Night environment when user sleeps, memory bubbles fade into dreams
 */
const DreamMode = ({ activities = [] }) => {
  const [isDreamMode, setIsDreamMode] = useState(false);
  const [sleepTime, setSleepTime] = useStorage('sleep-time', null);
  const [wakeTime, setWakeTime] = useStorage('wake-time', null);
  const [dreamBubbles, setDreamBubbles] = useState([]);
  const [showMorningGreeting, setShowMorningGreeting] = useState(false);
  const { speak } = useSpeech();

  // Check if it's nighttime (10 PM - 6 AM)
  const isNightTime = () => {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 6;
  };

  // Detect sleep mode (no activity for 2 hours during night)
  useEffect(() => {
    if (!isNightTime()) {
      setIsDreamMode(false);
      return;
    }

    const checkSleepMode = setInterval(() => {
      const now = Date.now();
      const lastActivity = activities[activities.length - 1];
      const lastActivityTime = lastActivity ? new Date(lastActivity.timestamp).getTime() : 0;
      const timeSinceActivity = now - lastActivityTime;
      
      // If no activity for 2 hours during night, enter dream mode
      if (timeSinceActivity > 7200000 && !isDreamMode) {
        setIsDreamMode(true);
        setSleepTime(new Date().toISOString());
        generateDreamBubbles();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkSleepMode);
  }, [activities]);

  // Generate dream bubbles from today's activities
  const generateDreamBubbles = () => {
    const today = new Date().toDateString();
    const todayActivities = activities.filter(
      a => new Date(a.timestamp).toDateString() === today
    );

    const bubbles = todayActivities.slice(-10).map((activity, i) => ({
      id: activity.id,
      text: activity.name,
      category: activity.category,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      delay: i * 0.3,
      size: Math.random() * 40 + 60,
    }));

    setDreamBubbles(bubbles);
  };

  // Morning wake detection
  useEffect(() => {
    if (!isDreamMode) return;

    const checkWake = setInterval(() => {
      const hour = new Date().getHours();
      
      // Between 6 AM - 10 AM, check for user activity
      if (hour >= 6 && hour < 10) {
        const now = Date.now();
        const lastActivity = activities[activities.length - 1];
        const lastActivityTime = lastActivity ? new Date(lastActivity.timestamp).getTime() : 0;
        
        // If there's recent activity (within 5 min), wake up
        if (now - lastActivityTime < 300000) {
          setIsDreamMode(false);
          setWakeTime(new Date().toISOString());
          setShowMorningGreeting(true);
          generateMorningGreeting();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkWake);
  }, [isDreamMode, activities]);

  const generateMorningGreeting = () => {
    const greetings = [
      "Good morning! I had dreams about all the things you accomplished yesterday ☀️",
      "Rise and shine! Your memories from yesterday were beautiful 🌅",
      "Morning! I kept your memories safe while you slept 💫",
      "Welcome back! Ready to make today just as amazing? 🌟",
    ];

    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    setTimeout(() => {
      speak(greeting, { rate: 0.9, pitch: 1.1 });
    }, 1000);

    setTimeout(() => {
      setShowMorningGreeting(false);
    }, 8000);
  };

  const getCategoryColor = (category) => {
    const colors = {
      work: 'from-blue-500/20 to-blue-700/20',
      personal: 'from-green-500/20 to-green-700/20',
      health: 'from-red-500/20 to-red-700/20',
      social: 'from-purple-500/20 to-purple-700/20',
      leisure: 'from-yellow-500/20 to-yellow-700/20',
    };
    return colors[category] || 'from-gray-500/20 to-gray-700/20';
  };

  if (!isDreamMode && !showMorningGreeting) return null;

  return (
    <>
      {/* Dream Mode Night Environment */}
      <AnimatePresence>
        {isDreamMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 pointer-events-none"
          >
            {/* Night sky gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black" />

            {/* Stars */}
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}

            {/* Moon */}
            <motion.div
              className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-300"
              style={{
                boxShadow: '0 0 60px 20px rgba(255, 255, 200, 0.3)',
              }}
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
            />

            {/* Dream bubbles - memories fading */}
            {dreamBubbles.map((bubble) => (
              <motion.div
                key={bubble.id}
                className={`absolute rounded-full bg-gradient-to-br ${getCategoryColor(bubble.category)} backdrop-blur-md border border-white/10 flex items-center justify-center p-4 text-center`}
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`,
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                }}
                initial={{ opacity: 0.7, scale: 1 }}
                animate={{
                  opacity: [0.7, 0.3, 0],
                  scale: [1, 1.2, 0.8],
                  y: [-20, -40, -60],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  delay: bubble.delay,
                }}
              >
                <span className="text-xs text-white/80 font-medium">
                  {bubble.text}
                </span>
              </motion.div>
            ))}

            {/* Sleep message */}
            <div className="absolute inset-x-0 bottom-20 text-center">
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                className="text-white/60 text-lg font-light"
              >
                Sweet dreams... I'm keeping your memories safe 💫
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Morning Greeting */}
      <AnimatePresence>
        {showMorningGreeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none"
          >
            {/* Sunrise gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-orange-300 via-yellow-200 to-blue-300 opacity-30" />

            {/* Greeting card */}
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50 }}
              className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md text-center"
            >
              {/* Sun rays */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`ray-${i}`}
                  className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t from-yellow-400 to-transparent origin-bottom"
                  style={{
                    transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                  }}
                  animate={{
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}

              <motion.div
                className="text-6xl mb-4"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                ☀️
              </motion.div>

              <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Good Morning!
              </h2>

              <p className="text-gray-700 dark:text-gray-200">
                I kept your memories safe while you slept
              </p>

              <motion.div
                className="mt-6 text-4xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
              >
                💫
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DreamMode;
