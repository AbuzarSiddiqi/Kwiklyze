import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAI } from '../context/AIContext';
import { useSpeech } from '../hooks/useSpeech';
import { formatDuration } from '../utils/timeUtils';
import CategoryPieChart from './Charts/CategoryPieChart';
import DailyChart from './Charts/DailyChart';

const EndOfDaySummary = ({ activities, tasks, routine, onClose }) => {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { getDailySummary } = useAI();
  const { speak } = useSpeech();

  const generateSummary = async () => {
    setIsGenerating(true);
    const aiSummary = await getDailySummary(activities, tasks, routine);
    setSummary(aiSummary);
    setIsGenerating(false);
    
    // Speak the summary
    speak(aiSummary);
  };

  const todayActivities = activities.filter(a => {
    const activityDate = new Date(a.timestamp);
    const today = new Date();
    return activityDate.toDateString() === today.toDateString();
  });

  const completedTasks = tasks.filter(t => t.completed);
  const missedTasks = tasks.filter(t => !t.completed && t.dueTime && new Date(t.dueTime) < new Date());

  const totalTime = todayActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
  
  const categoryTime = {};
  todayActivities.forEach(a => {
    if (a.duration) {
      categoryTime[a.category] = (categoryTime[a.category] || 0) + a.duration;
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">End of Day Summary 🌙</h2>
              <p className="opacity-90 mt-1">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-3xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold">{todayActivities.length}</div>
              <div className="text-sm opacity-90">Activities Logged</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
              <div className="text-sm opacity-90">Tasks Completed</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-2xl font-bold">{formatDuration(totalTime)}</div>
              <div className="text-sm opacity-90">Total Time Tracked</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <div className="text-3xl mb-2">⚠️</div>
              <div className="text-2xl font-bold">{missedTasks.length}</div>
              <div className="text-sm opacity-90">Missed Tasks</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="font-bold mb-3 dark:text-white">Activity Breakdown</h3>
              <DailyChart activities={todayActivities} />
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <h3 className="font-bold mb-3 dark:text-white">Time Distribution</h3>
              <CategoryPieChart activities={todayActivities} />
            </div>
          </div>

          {/* Category Summary */}
          {Object.keys(categoryTime).length > 0 && (
            <div>
              <h3 className="font-bold mb-3 dark:text-white">Time by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(categoryTime).map(([category, minutes]) => (
                  <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <div className="text-2xl mb-1">
                      {category === 'Work' && '💼'}
                      {category === 'Study' && '📚'}
                      {category === 'Exercise' && '🏃'}
                      {category === 'Meal' && '🍽️'}
                      {category === 'Leisure' && '🎮'}
                      {category === 'Sleep' && '😴'}
                    </div>
                    <div className="font-medium dark:text-white">{category}</div>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {formatDuration(minutes)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 dark:text-white flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                Completed Tasks
              </h3>
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="dark:text-white">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missed Tasks */}
          {missedTasks.length > 0 && (
            <div>
              <h3 className="font-bold mb-3 dark:text-white flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Missed Tasks
              </h3>
              <div className="space-y-2">
                {missedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <span className="text-red-500 text-xl">✕</span>
                    <span className="dark:text-white">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Summary */}
          <div>
            <h3 className="font-bold mb-3 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              AI Insights
            </h3>
            
            {!summary && !isGenerating && (
              <button
                onClick={generateSummary}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Generate AI Summary
              </button>
            )}

            {isGenerating && (
              <div className="flex items-center justify-center p-8">
                <div className="flex gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                  <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}

            {summary && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                  {summary}
                </p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close Summary
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EndOfDaySummary;
