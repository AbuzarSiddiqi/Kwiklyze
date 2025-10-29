import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '../context/AIContext';
import { useSpeech } from '../hooks/useSpeech';
import { formatDuration } from '../utils/timeUtils';

/**
 * Mirror Mode - End of day reflection visualization
 */
const MirrorMode = ({ activities, tasks, onClose }) => {
  const [reflectionPhase, setReflectionPhase] = useState('entering'); // entering, reflecting, summary
  const [aiReflection, setAiReflection] = useState('');
  const { getDailySummary } = useAI();
  const { speak } = useSpeech();

  useEffect(() => {
    // Phase transitions
    const timers = [
      setTimeout(() => setReflectionPhase('reflecting'), 2000),
      setTimeout(() => generateReflection(), 3000),
      setTimeout(() => setReflectionPhase('summary'), 5000),
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const generateReflection = async () => {
    const reflection = await getDailySummary(activities, tasks, []);
    setAiReflection(reflection);
    speak("Let me share what I see in your day...", { rate: 0.9, pitch: 0.9 });
    setTimeout(() => speak(reflection, { rate: 0.9 }), 2000);
  };

  // Calculate day's "brightness" based on activity
  const totalTime = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
  const completedTasks = tasks.filter(t => t.completed).length;
  const brightness = Math.min((totalTime / 480) + (completedTasks / 10), 1); // Max at 8 hours + 10 tasks

  // Day's dominant color based on most time spent
  const categoryTime = {};
  activities.forEach(a => {
    if (a.duration) {
      categoryTime[a.category] = (categoryTime[a.category] || 0) + a.duration;
    }
  });
  const dominantCategory = Object.keys(categoryTime).reduce((a, b) => 
    categoryTime[a] > categoryTime[b] ? a : b, 'Leisure'
  );

  const categoryColors = {
    Work: ['from-blue-400', 'to-blue-700'],
    Study: ['from-green-400', 'to-green-700'],
    Exercise: ['from-red-400', 'to-red-700'],
    Meal: ['from-yellow-400', 'to-yellow-700'],
    Leisure: ['from-purple-400', 'to-purple-700'],
    Sleep: ['from-indigo-400', 'to-indigo-700'],
  };

  const [gradientFrom, gradientTo] = categoryColors[dominantCategory] || categoryColors.Leisure;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      onClick={reflectionPhase === 'summary' ? onClose : null}
    >
      {/* Mirror surface with reflection */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Entering phase - mirror materializing */}
        <AnimatePresence mode="wait">
          {reflectionPhase === 'entering' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                🪞
              </motion.div>
              <p className="text-white text-2xl font-light">Reflecting on your day...</p>
            </motion.div>
          )}

          {/* Reflecting phase - showing day's energy */}
          {reflectionPhase === 'reflecting' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="relative w-96 h-96"
            >
              {/* Day's aura visualization */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-full`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [brightness * 0.6, brightness, brightness * 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Activity rings */}
              {Object.entries(categoryTime).map(([category, time], index) => {
                const percentage = time / totalTime;
                return (
                  <motion.div
                    key={category}
                    className="absolute inset-0 border-4 rounded-full"
                    style={{
                      borderColor: `rgba(255, 255, 255, ${percentage})`,
                      scale: 0.5 + (index * 0.15),
                    }}
                    animate={{
                      rotate: [0, 360],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 10 + index * 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                );
              })}

              {/* Center glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="text-white text-center"
                  animate={{
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <p className="text-4xl font-bold">{Math.round(brightness * 100)}%</p>
                  <p className="text-sm opacity-80">Day Brightness</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Summary phase - AI reflection */}
          {reflectionPhase === 'summary' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl px-8 text-center"
            >
              <motion.div
                className="mb-8"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <span className="text-6xl">✨</span>
              </motion.div>

              <h2 className="text-4xl font-bold text-white mb-6">Your Day's Reflection</h2>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6">
                <p className="text-white text-lg leading-relaxed whitespace-pre-line">
                  {aiReflection || "Generating your reflection..."}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-3xl mb-2">⏱️</p>
                  <p className="text-white font-bold">{formatDuration(totalTime)}</p>
                  <p className="text-white/60 text-sm">Tracked Time</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-3xl mb-2">✅</p>
                  <p className="text-white font-bold">{completedTasks}</p>
                  <p className="text-white/60 text-sm">Tasks Done</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-3xl mb-2">🎯</p>
                  <p className="text-white font-bold">{dominantCategory}</p>
                  <p className="text-white/60 text-sm">Main Focus</p>
                </div>
              </div>

              <p className="text-white/60 text-sm">Click anywhere to close</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MirrorMode;
