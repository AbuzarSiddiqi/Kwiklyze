import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { livingAI } from '../services/livingAI';
import { useSpeech } from '../hooks/useSpeech';
import { useEmotion } from '../context/EmotionContext';

/**
 * Companion Pet - Autonomous AI that proactively initiates conversations
 * Acts like a living friend/pet that checks in on you
 */
const CompanionPet = ({ activities = [], tasks = [] }) => {
  const [message, setMessage] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [petMood, setPetMood] = useState('playful');
  const { speak } = useSpeech();
  const { currentMood, energyLevel } = useEmotion();

  // Autonomous behavior - AI initiates conversation
  useEffect(() => {
    console.log('🐾 Companion Pet mounted and ready!');
    
    const checkInInterval = setInterval(async () => {
      // Check if AI wants to talk
      if (livingAI.shouldInitiateConversation()) {
        console.log('⏰ Time to check in!');
        await initiateConversation();
      }
    }, 60000); // Check every minute

    // Initial check-in after 10 seconds (for testing)
    const initialTimeout = setTimeout(() => {
      console.log('👋 Initial greeting...');
      initiateConversation();
    }, 10000); // 10 seconds for testing

    return () => {
      clearInterval(checkInInterval);
      clearTimeout(initialTimeout);
    };
  }, [activities, tasks]);

  // Update pet mood based on AI mood
  useEffect(() => {
    setPetMood(livingAI.state.mood);
  }, [livingAI.state.mood]);

  // AI initiates conversation
  const initiateConversation = async () => {
    console.log('🐾 Companion Pet: Initiating conversation...');
    setIsThinking(true);
    
    const context = {
      activities,
      tasks,
      timeOfDay: getTimeOfDay(),
      mood: currentMood,
      energyLevel,
    };

    try {
      console.log('🤖 Calling Groq AI for spontaneous thought...');
      const thought = await livingAI.generateSpontaneousThought(context);
      console.log('💬 AI thought received:', thought);
      
      if (thought) {
        setMessage({
          text: thought,
          timestamp: Date.now(),
          type: 'spontaneous',
        });
        
        // Speak the message with PlayAI voice
        speak(thought, { voice: 'Ruby-PlayAI', rate: 1.0 });
        
        // Move to random position
        moveToRandomPosition();
      } else {
        console.log('⚠️ No thought generated');
      }
    } catch (error) {
      console.error('❌ Companion Pet error:', error);
      console.error('Error details:', error.message);
      
      // Show fallback message
      setMessage({
        text: "Hey! Just checking in - how are you doing? 💙",
        timestamp: Date.now(),
        type: 'fallback',
      });
    } finally {
      setIsThinking(false);
    }
  };

  // Move pet to random position
  const moveToRandomPosition = () => {
    const newX = Math.random() * (window.innerWidth - 300);
    const newY = Math.random() * (window.innerHeight - 200);
    setPosition({ x: Math.max(20, newX), y: Math.max(20, newY) });
  };

  // Dismiss message
  const dismissMessage = () => {
    setMessage(null);
  };

  // Get time of day
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  // Get pet emoji based on mood
  const getPetEmoji = () => {
    return livingAI.getMoodEmoji();
  };

  return (
    <>
      {/* Floating Pet */}
      <motion.div
        className="fixed z-40 cursor-pointer"
        style={{ left: position.x, top: position.y }}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        onClick={message ? null : initiateConversation}
        title="Your AI Companion"
      >
        <div className="relative">
          {/* Pet Body */}
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-3xl shadow-2xl"
            animate={{
              scale: isThinking ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              repeat: isThinking ? Infinity : 0,
            }}
          >
            {getPetEmoji()}
          </motion.div>

          {/* Thinking indicator */}
          {isThinking && (
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg">
                <motion.span
                  className="text-sm"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  💭
                </motion.span>
              </div>
            </motion.div>
          )}

          {/* Activity indicator */}
          <motion.div
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />
        </div>
      </motion.div>

      {/* Spontaneous Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50"
            style={{
              left: Math.min(position.x + 80, window.innerWidth - 320),
              top: position.y,
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 max-w-xs border-2 border-purple-300 dark:border-purple-700">
              {/* Pet thought bubble pointer */}
              <div className="absolute -left-3 top-6 w-6 h-6 bg-white dark:bg-gray-800 border-l-2 border-b-2 border-purple-300 dark:border-purple-700 transform rotate-45" />
              
              <div className="relative">
                <p className="text-gray-800 dark:text-white mb-3">
                  {message.text}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {livingAI.getRelationshipLevel() === 'close' ? '💕 Close friend' :
                     livingAI.getRelationshipLevel() === 'familiar' ? '😊 Good friend' :
                     '👋 New friend'}
                  </span>

                  <button
                    onClick={dismissMessage}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                  >
                    Thanks! 💙
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CompanionPet;
