import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useNotifications } from '../hooks/useNotifications';
import { useSpeech } from '../hooks/useSpeech';

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'One-time', emoji: '📌' },
  { value: 'daily', label: 'Daily', emoji: '📅' },
  { value: 'weekly', label: 'Weekly', emoji: '🗓️' },
  { value: 'monthly', label: 'Monthly', emoji: '📆' }
];

const QUICK_ADD_SUGGESTIONS = [
  { text: 'Buy groceries', emoji: '🛒', time: 'today' },
  { text: 'Call mom', emoji: '📞', time: 'today' },
  { text: 'Workout', emoji: '💪', time: 'tomorrow' },
  { text: 'Meeting prep', emoji: '📋', time: 'today' },
  { text: 'Read book', emoji: '📚', time: 'evening' },
];

const TaskManager = ({ tasks, onAddTask, onUpdateTask, onDeleteTask }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [recurrence, setRecurrence] = useState('none');
  const [showConfetti, setShowConfetti] = useState(false);
  const [filterView, setFilterView] = useState('all'); // 'all', 'pending', 'completed'
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  const { showNotificationWithSpeech } = useNotifications();
  const { startListening, stopListening, isListening, transcript, resetTranscript } = useSpeech();

  // Handle voice input
  useEffect(() => {
    if (transcript && !isListening && isVoiceMode) {
      setNewTaskTitle(transcript);
      resetTranscript();
      setIsVoiceMode(false);
    }
  }, [transcript, isListening, isVoiceMode, resetTranscript]);

  const handleVoiceInput = () => {
    setIsVoiceMode(true);
    startListening();
  };

  const handleQuickAdd = (suggestion) => {
    setNewTaskTitle(suggestion.text);
    setShowAdvanced(false);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const task = {
      id: Date.now(),
      title: newTaskTitle,
      text: newTaskTitle, // For compatibility with companion
      dueTime: dueTime || null,
      time: dueTime ? new Date(dueTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null,
      date: dueTime ? new Date(dueTime).toLocaleDateString() : null,
      recurrence: recurrence !== 'none' ? recurrence : null,
      completed: false,
      createdAt: new Date().toISOString(),
      reminders: []
    };

    onAddTask(task);
    setNewTaskTitle('');
    setDueTime('');
    setRecurrence('none');
    setShowAdvanced(false);

    // Schedule notification if due time is set
    if (dueTime) {
      scheduleTaskReminder(task);
    }
  };

  const handleToggleComplete = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const updated = { ...task, completed: !task.completed };
      onUpdateTask(taskId, updated);

      if (!task.completed) {
        // Celebration for completion
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  };

  const scheduleTaskReminder = (task) => {
    if (!task.dueTime) return;

    const dueDate = new Date(task.dueTime);
    const now = new Date();
    const timeUntilDue = dueDate - now;

    if (timeUntilDue > 0) {
      // Remind 5 minutes before
      const reminderTime = timeUntilDue - (5 * 60 * 1000);
      if (reminderTime > 0) {
        setTimeout(() => {
          showNotificationWithSpeech(
            'Task Reminder',
            `${task.title} is due in 5 minutes!`,
            speak
          );
        }, reminderTime);
      }

      // Remind at due time
      setTimeout(() => {
        showNotificationWithSpeech(
          'Task Due!',
          task.title,
          speak
        );
      }, timeUntilDue);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterView === 'pending') return !task.completed;
    if (filterView === 'completed') return task.completed;
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-4">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}

      {/* Quick Add Task - Mobile First */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 dark:text-white">What's on your mind?</h2>
        
        {/* Quick suggestions */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {QUICK_ADD_SUGGESTIONS.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickAdd(suggestion)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-900/50 dark:hover:to-pink-900/50 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-200 transition-all"
            >
              <span>{suggestion.emoji}</span>
              <span>{suggestion.text}</span>
            </button>
          ))}
        </div>

        {/* Main input with voice */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Type or tap mic to add a task..."
            className="flex-1 px-4 py-3 text-sm sm:text-base rounded-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          
          {/* Beautiful Mic Button */}
          <div className="relative flex items-center justify-center flex-shrink-0">
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
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleVoiceInput}
              className="relative w-12 h-12 rounded-full flex items-center justify-center overflow-hidden shadow-lg"
              style={{
                background: isListening 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent rounded-full" />
              <motion.div
                animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
                className="relative z-10"
              >
                {isListening ? (
                  <img src="/Image/Pause.png" alt="Pause" className="w-6 h-6" />
                ) : (
                  <img src="/Image/Chat.png" alt="Mic" className="w-6 h-6" />
                )}
              </motion.div>
              <div className="absolute inset-1 rounded-full bg-white/10" />
            </motion.button>
          </div>
        </div>

        {/* Add button and advanced toggle */}
        <div className="flex gap-2">
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="flex-1 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
          >
            ➕ Add Task
          </button>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-4 py-3 rounded-full font-medium transition-all text-sm sm:text-base ${
              showAdvanced 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {showAdvanced ? '↑' : '⚙️'}
          </button>
        </div>

        {/* Advanced options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                {/* Time picker */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Due time</label>
                  <input
                    type="datetime-local"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Recurrence chips */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Repeat</label>
                  <div className="flex gap-2 flex-wrap">
                    {RECURRENCE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setRecurrence(opt.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          recurrence === opt.value
                            ? 'bg-purple-500 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {opt.emoji} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 sm:gap-2 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-lg">
        {[
          { value: 'all', label: 'All', count: tasks.length },
          { value: 'pending', label: 'Pending', count: pendingCount },
          { value: 'completed', label: 'Completed', count: completedCount }
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setFilterView(filter.value)}
            className={`flex-1 py-2 px-2 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-base font-medium transition-all ${
              filterView === filter.value
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <span className="hidden sm:inline">{filter.label} ({filter.count})</span>
            <span className="sm:hidden">{filter.label.charAt(0)} ({filter.count})</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-4xl mb-2">
              {filterView === 'completed' ? '🎉' : '✅'}
            </p>
            <p className="text-sm sm:text-base">
              {filterView === 'completed' 
                ? 'No completed tasks yet' 
                : filterView === 'pending'
                ? 'No pending tasks!'
                : 'No tasks yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                    task.completed
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task.id)}
                    className={`min-w-[24px] w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all touch-target ${
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-500 hover:border-purple-500'
                    }`}
                  >
                    {task.completed && <span className="text-white text-sm">✓</span>}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm sm:text-base font-medium ${task.completed ? 'line-through text-gray-500' : 'dark:text-white'}`}>
                      {task.title || task.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      {/* Show time if available */}
                      {task.time && (
                        <span className="truncate">⏰ {task.time}</span>
                      )}
                      {/* Show date if available */}
                      {task.date && (
                        <>
                          {task.time && <span>•</span>}
                          <span className="truncate">📅 {task.date}</span>
                        </>
                      )}
                      {/* Show dueTime if no separate time/date */}
                      {!task.time && !task.date && task.dueTime && (
                        <span className="truncate">📅 {new Date(task.dueTime).toLocaleString()}</span>
                      )}
                      {/* Show recurrence */}
                      {task.recurrence && task.recurrence !== 'none' && (
                        <>
                          <span>•</span>
                          <span>🔄 {task.recurrence}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="min-w-[32px] px-2 sm:px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm rounded-full transition-colors touch-target"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
