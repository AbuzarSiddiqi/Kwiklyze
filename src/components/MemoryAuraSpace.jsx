import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, formatDuration } from '../utils/timeUtils';

/**
 * 3D-style bubble visualization of daily activities as "auras"
 */
const MemoryAuraSpace = ({ activities }) => {
  const [hoveredBubble, setHoveredBubble] = useState(null);

  // Generate bubble positions in a spiral/organic pattern
  const getBubblePosition = (index, total) => {
    const angle = (index / total) * Math.PI * 4;
    const radius = 20 + (index % 3) * 15;
    
    return {
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius,
    };
  };

  // Get bubble size based on activity duration
  const getBubbleSize = (activity) => {
    const duration = activity.duration || 30;
    const baseSize = 40;
    const sizeMultiplier = Math.min(duration / 60, 3); // Max 3x size
    return baseSize + (sizeMultiplier * 20);
  };

  // Get bubble color based on category
  const getBubbleColor = (category) => {
    const colors = {
      Work: 'from-blue-400 to-blue-600',
      Study: 'from-green-400 to-green-600',
      Exercise: 'from-red-400 to-red-600',
      Meal: 'from-yellow-400 to-yellow-600',
      Leisure: 'from-purple-400 to-purple-600',
      Sleep: 'from-indigo-400 to-indigo-600',
    };
    return colors[category] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl overflow-hidden">
      {/* Title */}
      <div className="absolute top-4 left-4 z-20">
        <h3 className="text-xl font-bold text-white drop-shadow-lg">
          Memory Aura Space ✨
        </h3>
        <p className="text-sm text-white/80">Hover bubbles to see your day's vibe</p>
      </div>

      {/* Aura bubbles */}
      <div className="relative w-full h-full">
        {activities.map((activity, index) => {
          const position = getBubblePosition(index, activities.length);
          const size = getBubbleSize(activity);
          const color = getBubbleColor(activity.category);

          return (
            <motion.div
              key={activity.id}
              className="absolute cursor-pointer"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${size}px`,
                height: `${size}px`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: hoveredBubble === activity.id ? 1.2 : 1,
                opacity: 0.8,
              }}
              whileHover={{
                scale: 1.3,
                zIndex: 10,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: index * 0.05,
              }}
              onHoverStart={() => setHoveredBubble(activity.id)}
              onHoverEnd={() => setHoveredBubble(null)}
            >
              {/* Bubble glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-full blur-md opacity-60`} />
              
              {/* Bubble core */}
              <div className={`absolute inset-0 bg-gradient-to-br ${color} rounded-full border-2 border-white/30`}>
                {/* Category emoji */}
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  {activity.category === 'Work' && '💼'}
                  {activity.category === 'Study' && '📚'}
                  {activity.category === 'Exercise' && '🏃'}
                  {activity.category === 'Meal' && '🍽️'}
                  {activity.category === 'Leisure' && '🎮'}
                  {activity.category === 'Sleep' && '😴'}
                </div>
              </div>

              {/* Pulsing ring */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${color} rounded-full`}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />

              {/* Hover tooltip */}
              <AnimatePresence>
                {hoveredBubble === activity.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-lg whitespace-nowrap text-sm shadow-xl"
                  >
                    <p className="font-bold">{activity.description}</p>
                    <p className="text-xs text-gray-300">
                      {formatTime(new Date(activity.timestamp))}
                      {activity.duration && ` • ${formatDuration(activity.duration)}`}
                    </p>
                    <p className="text-xs text-purple-300">{activity.category}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Central energy core */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white to-purple-300 rounded-full blur-2xl" />
      </motion.div>
    </div>
  );
};

export default MemoryAuraSpace;
