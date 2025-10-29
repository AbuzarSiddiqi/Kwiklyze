import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeech } from '../hooks/useSpeech';
import { useStorage } from '../hooks/useStorage';

/**
 * AI Journal - Soft prompts throughout the day for reflection
 */
const AIJournal = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [userResponse, setUserResponse] = useState('');
  const [journalEntries, setJournalEntries] = useStorage('journal-entries', []);
  const { speak } = useSpeech();

  const journalPrompts = [
    { question: "What made you smile today? 😊", emoji: "😊", category: "gratitude" },
    { question: "What are you proud of right now? 🌟", emoji: "🌟", category: "achievement" },
    { question: "Write one line for your future self ✨", emoji: "✨", category: "reflection" },
    { question: "What's one thing you learned today? 📚", emoji: "📚", category: "growth" },
    { question: "How are you feeling in this moment? 💭", emoji: "💭", category: "emotion" },
    { question: "What would make tomorrow even better? 🌅", emoji: "🌅", category: "intention" },
    { question: "Name something you're grateful for 🙏", emoji: "🙏", category: "gratitude" },
    { question: "What challenged you today? 💪", emoji: "💪", category: "challenge" },
  ];

  // Randomly trigger prompts
  useEffect(() => {
    const triggerRandomPrompt = () => {
      const shouldShow = Math.random() > 0.7;
      if (shouldShow) {
        const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
        setCurrentPrompt(randomPrompt);
        setShowPrompt(true);
        speak(randomPrompt.question, { rate: 0.9, pitch: 1.0 });
      }
    };

    // Check every 30-60 minutes
    const interval = setInterval(triggerRandomPrompt, 1800000 + Math.random() * 1800000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSaveEntry = () => {
    if (!userResponse.trim()) return;

    const entry = {
      id: Date.now(),
      prompt: currentPrompt.question,
      response: userResponse,
      category: currentPrompt.category,
      timestamp: new Date().toISOString(),
      emoji: currentPrompt.emoji
    };

    setJournalEntries(prev => [...prev, entry]);
    setUserResponse('');
    setShowPrompt(false);
    
    speak("Beautiful. I've saved this moment for you.", { rate: 0.9 });
  };

  const handleSkip = () => {
    setShowPrompt(false);
    setUserResponse('');
  };

  return (
    <>
      {/* Prompt modal */}
      <AnimatePresence>
        {showPrompt && currentPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={handleSkip}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Emoji */}
              <motion.div
                className="text-6xl text-center mb-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                {currentPrompt.emoji}
              </motion.div>

              {/* Question */}
              <h3 className="text-2xl font-bold text-center mb-6 dark:text-white">
                {currentPrompt.question}
              </h3>

              {/* Input */}
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Your thoughts..."
                className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
                autoFocus
              />

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSkip}
                  className="flex-1 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSaveEntry}
                  disabled={!userResponse.trim()}
                  className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Save ✨
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Journal entries viewer (can be opened from settings/dashboard) */}
      {/* This would be a separate component/modal for viewing past entries */}
    </>
  );
};

export default AIJournal;

// Export journal entries viewer component
export const JournalViewer = ({ entries, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
      >
        <h2 className="text-3xl font-bold mb-6 dark:text-white flex items-center gap-2">
          <span>📖</span>
          Your Journal Moments
        </h2>

        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-4xl mb-2">✨</p>
              <p>No journal entries yet</p>
              <p className="text-sm mt-1">I'll ask you soft questions throughout the day</p>
            </div>
          ) : (
            entries.reverse().map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border-2 border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{entry.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                      {entry.prompt}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200 mb-2">
                      {entry.response}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};
