import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersonality } from '../context/PersonalityContext';
import { useEmotion } from '../context/EmotionContext';
import { useSpeech } from '../hooks/useSpeech';
import { useCharacter } from '../hooks/useCharacter';
import { livingAI } from '../services/livingAI';
import { getGreeting } from '../utils/timeUtils';

const AIAssistant = ({ activities, tasks, routine }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const { personality, currentPersonality } = usePersonality();
  const { currentMood, energyLevel } = useEmotion();
  const { speak, startListening, stopListening, isListening, transcript, resetTranscript } = useSpeech();
  const { selectedCharacter, changeState } = useCharacter();
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle voice input
  useEffect(() => {
    if (transcript && !isListening) {
      setInputText(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, resetTranscript]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const message = inputText.trim();
    setInputText('');
    
    // Add user message
    setMessages(prev => [...prev, { 
      id: Date.now(), 
      role: 'user', 
      content: message,
      timestamp: Date.now()
    }]);
    setIsThinking(true);

    // Get AI response using Groq
    const context = {
      activities,
      tasks,
      routine,
      mood: currentMood,
      energyLevel,
      timeOfDay: getTimeOfDay(),
    };

    try {
      changeState('thinking');
      const response = await livingAI.generateResponse(message, context);
      
      // Add AI response
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        role: 'assistant', 
        content: response,
        timestamp: Date.now()
      }]);
      
      // Speak the response with character's voice
      changeState('talking');
      speak(response, { voice: selectedCharacter?.voice || 'Ruby-PlayAI' });
      
      // Return to idle after speaking
      setTimeout(() => changeState('idle'), 3000);
    } catch (error) {
      console.error('AI Error:', error);
      changeState('idle');
      setMessages(prev => [...prev, { 
        id: Date.now(),
        role: 'assistant', 
        content: "I'm here for you! Tell me more! 💫",
        timestamp: Date.now()
      }]);
    } finally {
      setIsThinking(false);
    }
  };  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating AI Bubble */}
      <motion.div
        className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 ${isExpanded ? 'hidden' : 'block'}`}
        drag
        dragConstraints={{ left: -300, right: 0, top: -500, bottom: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <button
          onClick={() => setIsExpanded(true)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg flex items-center justify-center text-2xl sm:text-3xl animate-float touch-target"
        >
          {personality.emoji}
        </button>
      </motion.div>

      {/* Expanded Chat Interface */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed inset-x-4 bottom-4 sm:bottom-6 sm:right-6 sm:left-auto sm:w-96 h-[calc(100vh-8rem)] sm:h-[32rem] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 sm:p-4 flex items-center justify-between safe-top">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl">{personality.emoji}</span>
                <div>
                  <h3 className="text-white font-bold text-sm sm:text-base">KwikLyze</h3>
                  <p className="text-white/80 text-xs hidden sm:block">{getGreeting()}</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/80 hover:text-white text-xl sm:text-2xl touch-target"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <p className="text-4xl mb-2">{personality.emoji}</p>
                  <p>Hi! I'm KwikLyze, your AI companion.</p>
                  <p className="text-sm mt-2">How can I help you today?</p>
                </div>
              )}
              
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.timestamp && (
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t dark:border-gray-700 safe-bottom">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type or speak..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleVoiceToggle}
                  className={`w-11 h-11 sm:w-10 sm:h-10 rounded-full flex items-center justify-center touch-target ${
                    isListening ? 'bg-red-500 animate-pulse' : 'bg-purple-500 hover:bg-purple-600'
                  } text-white transition-colors`}
                >
                  🎤
                </button>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isThinking}
                  className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white flex items-center justify-center transition-colors touch-target"
                >
                  ➤
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
