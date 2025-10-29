import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Mon', full: 'Monday', emoji: '�' },
  { id: 'tuesday', label: 'Tue', full: 'Tuesday', emoji: '📅' },
  { id: 'wednesday', label: 'Wed', full: 'Wednesday', emoji: '📅' },
  { id: 'thursday', label: 'Thu', full: 'Thursday', emoji: '�' },
  { id: 'friday', label: 'Fri', full: 'Friday', emoji: '📅' },
  { id: 'saturday', label: 'Sat', full: 'Saturday', emoji: '🎉' },
  { id: 'sunday', label: 'Sun', full: 'Sunday', emoji: '😊' },
];

const TIME_BLOCKS = [
  { id: 'morning', label: 'Morning', time: '6:00 - 12:00', icon: '�', color: 'from-orange-400 to-yellow-400' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 - 18:00', icon: '☀️', color: 'from-yellow-400 to-orange-500' },
  { id: 'evening', label: 'Evening', time: '18:00 - 22:00', icon: '�', color: 'from-purple-400 to-pink-500' },
  { id: 'night', label: 'Night', time: '22:00 - 6:00', icon: '🌙', color: 'from-indigo-500 to-purple-600' },
];

const QUICK_ACTIVITIES = [
  { text: 'Gym', icon: '💪' },
  { text: 'Work', icon: '💼' },
  { text: 'Study', icon: '📚' },
  { text: 'Breakfast', icon: '🍳' },
  { text: 'Lunch', icon: '🍱' },
  { text: 'Dinner', icon: '🍽️' },
  { text: 'Sleep', icon: '😴' },
  { text: 'Netflix', icon: '📺' },
];

const RoutinePlanner = ({ routine, onUpdateRoutine }) => {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [activityInput, setActivityInput] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [weeklyRoutine, setWeeklyRoutine] = useState(() => {
    // Try to load from localStorage first
    const saved = localStorage.getItem('weeklyRoutine');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load weekly routine:', e);
      }
    }
    
    // If no saved data, initialize with empty routines for each day
    const initial = {};
    DAYS_OF_WEEK.forEach(day => {
      initial[day.id] = [];
    });
    return initial;
  });

  // Save to storage when routine changes
  useEffect(() => {
    console.log('💾 Saving routine to localStorage:', weeklyRoutine);
    localStorage.setItem('weeklyRoutine', JSON.stringify(weeklyRoutine));
  }, [weeklyRoutine]);

  const addActivity = () => {
    if (!activityInput.trim() || !startTime || !endTime) {
      return;
    }

    const newActivity = {
      id: Date.now(),
      text: activityInput.trim(),
      startTime,
      endTime
    };

    setWeeklyRoutine(prev => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newActivity].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      )
    }));

    setActivityInput('');
    setStartTime('');
    setEndTime('');
  };

  const quickAdd = (activityText) => {
    if (!startTime || !endTime) {
      alert('Please set start and end times first');
      return;
    }

    const newActivity = {
      id: Date.now(),
      text: activityText,
      startTime,
      endTime
    };

    setWeeklyRoutine(prev => ({
      ...prev,
      [selectedDay]: [...prev[selectedDay], newActivity].sort((a, b) => 
        a.startTime.localeCompare(b.startTime)
      )
    }));

    setStartTime('');
    setEndTime('');
  };

  const removeActivity = (activityId) => {
    setWeeklyRoutine(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].filter(a => a.id !== activityId)
    }));
  };

  const updateActivity = (activityId, field, value) => {
    setWeeklyRoutine(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(a => 
        a.id === activityId ? { ...a, [field]: value } : a
      ).sort((a, b) => a.startTime.localeCompare(b.startTime))
    }));
  };

  const copyDayRoutine = (fromDay) => {
    setWeeklyRoutine(prev => ({
      ...prev,
      [selectedDay]: [...prev[fromDay]]
    }));
    setShowCopyMenu(false);
  };

  const applyToAllWeekdays = () => {
    const currentRoutine = weeklyRoutine[selectedDay];
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    
    setWeeklyRoutine(prev => {
      const updated = { ...prev };
      weekdays.forEach(day => {
        updated[day] = [...currentRoutine];
      });
      return updated;
    });
  };

  const applyToAllDays = () => {
    const currentRoutine = weeklyRoutine[selectedDay];
    
    setWeeklyRoutine(prev => {
      const updated = { ...prev };
      DAYS_OF_WEEK.forEach(day => {
        updated[day.id] = [...currentRoutine];
      });
      return updated;
    });
  };

  const clearDay = () => {
    setWeeklyRoutine(prev => ({
      ...prev,
      [selectedDay]: []
    }));
  };

  const getDayProgress = (dayId) => {
    return weeklyRoutine[dayId]?.length || 0;
  };

  const currentDayRoutine = weeklyRoutine[selectedDay] || [];
  const totalActivities = currentDayRoutine.length;

  const calculateDuration = (start, end) => {
    if (!start || !end) return '';
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    const diff = (endDate - startDate) / (1000 * 60);
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Weekly Routine 📅</h2>
        <p className="text-white/90 text-sm">
          Plan your week and repeat similar days
        </p>
      </div>

      {/* Day Selector */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {DAYS_OF_WEEK.map((day) => {
            const progress = getDayProgress(day.id);
            const isActive = selectedDay === day.id;
            
            return (
              <motion.button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="text-xs font-medium mb-1">{day.label}</div>
                <div className="text-lg">{day.emoji}</div>
                {progress > 0 && (
                  <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {progress} tasks
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowCopyMenu(!showCopyMenu)}
          className="flex-1 px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:shadow-lg transition-all"
        >
          📋 Copy from...
        </button>
        <button
          onClick={clearDay}
          className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl text-sm font-medium text-red-500 hover:shadow-lg transition-all"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Copy Menu */}
      <AnimatePresence>
        {showCopyMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 overflow-hidden"
          >
            <h3 className="font-bold mb-3 text-gray-700 dark:text-gray-300">Copy routine:</h3>
            
            {/* Quick Copy Options */}
            <div className="space-y-2 mb-3">
              <button
                onClick={applyToAllWeekdays}
                className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
              >
                📅 Apply to All Weekdays (Mon-Fri)
              </button>
              <button
                onClick={applyToAllDays}
                className="w-full px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all"
              >
                🌟 Apply to All Days
              </button>
            </div>

            {/* Individual Days */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Or copy from specific day:</p>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.filter(d => d.id !== selectedDay).map((day) => (
                  <button
                    key={day.id}
                    onClick={() => copyDayRoutine(day.id)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all"
                  >
                    {day.emoji} {day.full}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Activity Form */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4">
        <h3 className="font-bold mb-3 text-gray-700 dark:text-gray-300">Add Activity</h3>
        
        {/* Quick Add Chips */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick add:</div>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIVITIES.map((activity) => (
              <button
                key={activity.text}
                onClick={() => setActivityInput(`${activity.icon} ${activity.text}`)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all"
              >
                {activity.icon} {activity.text}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Input */}
        <input
          type="text"
          value={activityInput}
          onChange={(e) => setActivityInput(e.target.value)}
          placeholder="Activity name (e.g., Morning Workout)"
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
        />

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Duration Preview */}
        {startTime && endTime && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
            Duration: {calculateDuration(startTime, endTime)}
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={addActivity}
          disabled={!activityInput.trim() || !startTime || !endTime}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          ➕ Add Activity
        </button>
      </div>

      {/* Activities List */}
      {currentDayRoutine.length > 0 ? (
        <div className="space-y-2">
          <h3 className="font-bold text-gray-700 dark:text-gray-300 px-2">
            {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.full}'s Schedule
          </h3>
          <AnimatePresence>
            {currentDayRoutine.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Time Display */}
                  <div className="flex-shrink-0">
                    <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {activity.startTime}
                    </div>
                    <div className="text-xs text-gray-400">↓</div>
                    <div className="text-sm font-bold text-pink-600 dark:text-pink-400">
                      {activity.endTime}
                    </div>
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 dark:text-white mb-1">
                      {activity.text}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ⏱️ {calculateDuration(activity.startTime, activity.endTime)}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeActivity(activity.id)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl mb-3">📋</div>
          <h3 className="font-bold text-gray-800 dark:text-white mb-2">
            No activities for {DAYS_OF_WEEK.find(d => d.id === selectedDay)?.full}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Start adding activities to plan your day!
          </p>
        </div>
      )}

      {/* Weekly Summary */}
      {currentDayRoutine.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-5 text-white">
          <h3 className="font-bold mb-3">Today's Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="text-2xl mb-1">📝</div>
              <div className="text-xs opacity-90">Activities</div>
              <div className="text-xl font-bold">{totalActivities}</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="text-2xl mb-1">⏰</div>
              <div className="text-xs opacity-90">Total Time</div>
              <div className="text-xl font-bold">
                {(() => {
                  const totalMins = currentDayRoutine.reduce((acc, act) => {
                    if (!act.startTime || !act.endTime) return acc;
                    const start = new Date(`2000-01-01T${act.startTime}`);
                    const end = new Date(`2000-01-01T${act.endTime}`);
                    return acc + (end - start) / (1000 * 60);
                  }, 0);
                  const hours = Math.floor(totalMins / 60);
                  return `${hours}h`;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutinePlanner;
