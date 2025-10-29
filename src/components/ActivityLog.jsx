import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeech } from '../hooks/useSpeech';
import { formatTime, calculateDuration, formatDuration } from '../utils/timeUtils';

const CATEGORIES = [
  { name: 'Work', emoji: '💼', color: 'bg-blue-500' },
  { name: 'Study', emoji: '📚', color: 'bg-green-500' },
  { name: 'Exercise', emoji: '🏃', color: 'bg-red-500' },
  { name: 'Meal', emoji: '🍽️', color: 'bg-yellow-500' },
  { name: 'Leisure', emoji: '🎮', color: 'bg-purple-500' },
  { name: 'Sleep', emoji: '😴', color: 'bg-indigo-500' },
];

const ActivityLog = ({ activities, onAddActivity, onUpdateActivity, onDeleteActivity }) => {
  const [newActivity, setNewActivity] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { startListening, stopListening, isListening, transcript, resetTranscript } = useSpeech();

  // Auto-detect category from activity description
  const detectCategory = (description) => {
    const lowerDesc = description.toLowerCase();
    
    // Work-related keywords
    if (lowerDesc.match(/work|meeting|presentation|project|email|call|office|client|deadline|report/)) {
      return 'Work';
    }
    // Study-related keywords
    if (lowerDesc.match(/study|learn|read|course|homework|research|tutorial|class|exam|practice/)) {
      return 'Study';
    }
    // Exercise-related keywords
    if (lowerDesc.match(/exercise|gym|run|walk|workout|yoga|sport|bike|swim|fitness|jog/)) {
      return 'Exercise';
    }
    // Meal-related keywords
    if (lowerDesc.match(/eat|meal|breakfast|lunch|dinner|snack|food|cook|restaurant|coffee|drink/)) {
      return 'Meal';
    }
    // Sleep-related keywords
    if (lowerDesc.match(/sleep|nap|rest|bed|tired|wake/)) {
      return 'Sleep';
    }
    // Default to Leisure
    return 'Leisure';
  };

  // Handle voice input
  useEffect(() => {
    if (transcript && !isListening && isVoiceMode) {
      setNewActivity(transcript);
      resetTranscript();
      setIsVoiceMode(false);
    }
  }, [transcript, isListening, isVoiceMode, resetTranscript]);

  const handleAddActivity = () => {
    if (!newActivity.trim()) return;

    setIsAnalyzing(true);
    const detectedCategory = detectCategory(newActivity);

    const activity = {
      id: Date.now(),
      description: newActivity,
      category: detectedCategory,
      timestamp: new Date().toISOString(),
      startTime: new Date().toISOString(),
      endTime: null,
      duration: null
    };

    onAddActivity(activity);
    
    setNewActivity('');
    setIsAnalyzing(false);
  };

  const handleVoiceInput = () => {
    setIsVoiceMode(true);
    startListening();
  };

  const handleEndActivity = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity && !activity.endTime) {
      const endTime = new Date().toISOString();
      const duration = calculateDuration(activity.startTime, endTime);
      
      onUpdateActivity(activityId, {
        ...activity,
        endTime,
        duration
      });
    }
  };

  const todayActivities = activities.filter(a => {
    const activityDate = new Date(a.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString();
  });

  return (
    <div className="space-y-4">
      {/* Input Section - Mobile Optimized */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 dark:text-white">What are you doing?</h2>
        
        {/* Info text */}
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
          Just type what you're doing - we'll automatically categorize it for you! 🎯
        </p>

        {/* Input - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <input
              type="text"
              value={newActivity}
              onChange={(e) => setNewActivity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
              placeholder="e.g., 'Working on presentation' or 'Going for a run'"
              className="flex-1 px-4 py-3 rounded-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
              disabled={isAnalyzing}
            />
            
            {/* Beautiful Mic Button */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              {/* Pulsing rings when listening */}
              {isListening && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                </>
              )}
              
              {/* Main button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleVoiceInput}
                disabled={isAnalyzing}
                className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden shadow-lg"
                style={{
                  background: isListening 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
                }}
              >
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent rounded-full" />
                
                {/* Icon */}
                <motion.div
                  animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
                  className="relative z-10"
                >
                  {isListening ? (
                    <img src="/Image/Pause.png" alt="Pause" className="w-8 h-8" />
                  ) : (
                    <img src="/Image/Chat.png" alt="Mic" className="w-8 h-8" />
                  )}
                </motion.div>

                {/* Inner glow */}
                <div className="absolute inset-1 rounded-full bg-white/10" />
              </motion.button>
            </div>
          </div>
          <button
            onClick={handleAddActivity}
            disabled={!newActivity.trim() || isAnalyzing}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin">⚡</span>
                Analyzing...
              </>
            ) : (
              'Add Activity'
            )}
          </button>
        </div>
      </div>

      {/* Timeline - Mobile Optimized */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">Today's Timeline</h3>
        
        {todayActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm sm:text-base">No activities logged yet today</p>
            <p className="text-xs sm:text-sm mt-1">Start by logging what you're doing!</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {todayActivities.reverse().map((activity, index) => {
                const category = CATEGORIES.find(c => c.name === activity.category);
                const isOngoing = !activity.endTime;
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:shadow-md transition-shadow"
                  >
                    {/* Category Icon */}
                    <div className={`${category?.color} w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0`}>
                      {category?.emoji}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium dark:text-white">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>{formatTime(new Date(activity.timestamp))}</span>
                        {activity.duration && (
                          <>
                            <span>•</span>
                            <span className="font-medium">{formatDuration(activity.duration)}</span>
                          </>
                        )}
                        {isOngoing && (
                          <>
                            <span>•</span>
                            <span className="text-green-500 font-medium animate-pulse">Ongoing</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {isOngoing && (
                        <button
                          onClick={() => handleEndActivity(activity.id)}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-full transition-colors"
                        >
                          End
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteActivity(activity.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-full transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
