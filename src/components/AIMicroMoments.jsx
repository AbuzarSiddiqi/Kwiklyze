import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersonality } from '../context/PersonalityContext';
import { useSpeech } from '../hooks/useSpeech';

/**
 * Human-like micro-interactions from the AI companion
 */
const AIMicroMoments = () => {
  const [currentMoment, setCurrentMoment] = useState(null);
  const [showMoment, setShowMoment] = useState(false);
  const { personality } = usePersonality();
  const { speak } = useSpeech();

  // Collection of micro-moment responses
  const microMoments = {
    idle: [
      { text: "*hums softly*", emoji: "🎵", sound: true },
      { text: "*gentle sigh*", emoji: "😌", sound: true },
      { text: "Still here with you...", emoji: "💫", sound: false },
    ],
    achievement: [
      { text: "I'm proud of you! 🌟", emoji: "🎉", sound: true },
      { text: "Look at you go!", emoji: "⚡", sound: true },
      { text: "You're crushing it!", emoji: "🔥", sound: true },
    ],
    missed: [
      { text: "*playful sigh*", emoji: "😅", sound: true },
      { text: "Hey, it's okay. Tomorrow's a new day.", emoji: "🌅", sound: false },
      { text: "No worries, we'll get 'em next time!", emoji: "💪", sound: false },
    ],
    surprise: [
      { text: "🎁 Surprise! You've been consistent for 3 days!", emoji: "🎁", sound: true },
      { text: "Plot twist: You're doing amazing!", emoji: "✨", sound: true },
      { text: "Fun fact: You're more productive than 80% of users!", emoji: "📊", sound: false },
    ],
    encouragement: [
      { text: "I believe in you! ❤️", emoji: "❤️", sound: true },
      { text: "You've got this!", emoji: "💪", sound: true },
      { text: "One step at a time, friend.", emoji: "🌱", sound: false },
    ]
  };

  // Random micro-moment triggers
  useEffect(() => {
    // Idle moments (every 5-10 minutes)
    const idleInterval = setInterval(() => {
      const shouldTrigger = Math.random() > 0.7;
      if (shouldTrigger) {
        triggerMoment('idle');
      }
    }, 300000 + Math.random() * 300000); // 5-10 minutes

    // Surprise moments (every 30-60 minutes)
    const surpriseInterval = setInterval(() => {
      const shouldTrigger = Math.random() > 0.8;
      if (shouldTrigger) {
        triggerMoment('surprise');
      }
    }, 1800000 + Math.random() * 1800000); // 30-60 minutes

    return () => {
      clearInterval(idleInterval);
      clearInterval(surpriseInterval);
    };
  }, []);

  const triggerMoment = (type, customMessage = null) => {
    if (customMessage) {
      setCurrentMoment(customMessage);
    } else {
      const moments = microMoments[type];
      const randomMoment = moments[Math.floor(Math.random() * moments.length)];
      setCurrentMoment(randomMoment);
      
      // Speak the moment if it has sound
      if (randomMoment.sound && randomMoment.text.indexOf('*') === -1) {
        speak(randomMoment.text, personality.voice);
      }
    }
    
    setShowMoment(true);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setShowMoment(false);
    }, 4000);
  };

  // Expose trigger function globally
  useEffect(() => {
    window.triggerAIMoment = triggerMoment;
  }, []);

  return (
    <AnimatePresence>
      {showMoment && currentMoment && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <span className="text-2xl">{currentMoment.emoji}</span>
            <p className="font-medium">{currentMoment.text}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIMicroMoments;

// Export trigger function for external use
export const triggerAIMoment = (type, customMessage) => {
  if (window.triggerAIMoment) {
    window.triggerAIMoment(type, customMessage);
  }
};
