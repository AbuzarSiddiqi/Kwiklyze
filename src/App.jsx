import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AIProvider } from './context/AIContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { PersonalityProvider } from './context/PersonalityContext';
import { EmotionProvider } from './context/EmotionContext';
import { useStorage } from './hooks/useStorage';
import { useNotifications } from './hooks/useNotifications';
import { useSpeech } from './hooks/useSpeech';
import { useCharacter } from './hooks/useCharacter';
import { getGreeting } from './utils/timeUtils';
import ActivityLog from './components/ActivityLog';
import TaskManager from './components/TaskManager';
import RoutinePlanner from './components/RoutinePlanner';
import Dashboard from './components/Dashboard';
import MirrorMode from './components/MirrorMode';
import WeeklyTrends from './components/Charts/WeeklyTrends';
import LivingBackground from './components/LivingBackground';
import AIMicroMoments from './components/AIMicroMoments';
import EnvironmentSimulator from './components/EnvironmentSimulator';
import MemoryAuraSpace from './components/MemoryAuraSpace';
import AIJournal from './components/AIJournal';
import EmotionGraphFusion from './components/EmotionGraphFusion';
import SettingsPanel from './components/SettingsPanel';
import CharacterSelector from './components/CharacterSelector';
import CompanionScreen from './components/CompanionScreen';
import Toast from './components/Toast';

function AppContent() {
  const [activeTab, setActiveTab] = useState('today');
  const [showMirrorMode, setShowMirrorMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMainApp, setShowMainApp] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  const [activities, setActivities] = useStorage('activities', []);
  const [tasks, setTasks] = useStorage('tasks', []);
  const [routine, setRoutine] = useStorage('routine', []);
  
  const { gradient, timeOfDay } = useTheme();
  const { requestPermission } = useNotifications();
  const { speak } = useSpeech();
  const { selectedCharacter, selectCharacter } = useCharacter();

  // Removed duplicate greeting - greeting is now handled in CompanionScreen.jsx
  
  // Request notification permission on load
  useEffect(() => {
    if (selectedCharacter) {
      requestPermission();
    }
  }, [requestPermission, selectedCharacter]);

  // Activity handlers
  const handleAddActivity = (activity) => {
    setActivities(prev => [...prev, activity]);
  };

  const handleUpdateActivity = (id, updatedActivity) => {
    setActivities(prev => prev.map(a => a.id === id ? updatedActivity : a));
  };

  const handleDeleteActivity = (id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // Task handlers
  const handleAddTask = (task) => {
    setTasks(prev => [...prev, task]);
  };

  const handleUpdateTask = (id, updatedTask) => {
    setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Routine handlers
  const handleUpdateRoutine = (newRoutine) => {
    setRoutine(newRoutine);
  };

  const tabs = [
    { id: 'today', label: 'Today', icon: '📅' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'routine', label: 'Routine', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
  ];

  // Show character selector if no character is selected
  if (!selectedCharacter) {
    return <CharacterSelector onSelect={selectCharacter} />;
  }

  // Show companion screen if main app not opened yet
  if (!showMainApp) {
    return (
      <CompanionScreen 
        onOpenApp={() => setShowMainApp(true)}
        activities={activities}
        tasks={tasks}
        routine={routine}
        onAddActivity={handleAddActivity}
        onUpdateActivity={handleUpdateActivity}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onUpdateRoutine={handleUpdateRoutine}
      />
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Living Background Layer */}
      <div className="fixed inset-0 -z-10">
        <LivingBackground />
      </div>
      
      {/* Environment Simulator (particles, sun, moon, etc) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <EnvironmentSimulator timeOfDay={timeOfDay} />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-24">
        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  KwikLyze
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Your AI-powered daily companion 🤖
                </p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 sm:p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-xl sm:text-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all touch-target"
                title="Settings"
              >
                ⚙️
              </button>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowMirrorMode(true)}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs sm:text-sm font-medium hover:shadow-lg transition-all touch-target"
              >
                <span className="hidden sm:inline">View Mirror Mode 🪞</span>
                <span className="sm:hidden">Mirror 🪞</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {activeTab === 'today' && (
            <div className="space-y-4 sm:space-y-6">
              <ActivityLog
                activities={activities}
                onAddActivity={handleAddActivity}
                onUpdateActivity={handleUpdateActivity}
                onDeleteActivity={handleDeleteActivity}
              />
              <Dashboard activities={activities} tasks={tasks} routine={routine} />
            </div>
          )}

          {activeTab === 'tasks' && (
            <TaskManager
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'routine' && (
            <RoutinePlanner
              routine={routine}
              onUpdateRoutine={handleUpdateRoutine}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Emotion Graph Fusion */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Emotional Timeline ❤️</h2>
                <EmotionGraphFusion activities={activities} />
              </div>
              
              {/* Memory Aura Space */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Memory Aura 💫</h2>
                <MemoryAuraSpace activities={activities} />
              </div>
              
              {/* Weekly Trends */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 dark:text-white">Weekly Trends</h2>
                <WeeklyTrends activities={activities} />
              </div>
              
              <Dashboard activities={activities} tasks={tasks} routine={routine} />
            </div>
          )}
        </main>

        {/* AI Micro Moments */}
        <AIMicroMoments />
        
        {/* AI Journal Prompts */}
        <AIJournal />

        {/* Mirror Mode Modal */}
        <AnimatePresence>
          {showMirrorMode && (
            <MirrorMode
              activities={activities}
              tasks={tasks}
              onClose={() => setShowMirrorMode(false)}
            />
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <SettingsPanel onClose={() => setShowSettings(false)} />
          )}
        </AnimatePresence>

        {/* Bottom Navigation Pill with Center Companion Button */}
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
          <div className="relative">
            {/* Navigation pill with notch cut */}
            <div className="relative bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 dark:border-gray-700/30 p-2 flex gap-1 items-center">
              {/* Notch cutout - semicircle cut at top center with animation */}
              <motion.div 
                className="absolute -top-0 w-20 h-10 bg-transparent"
                animate={{
                  left: activeTab === 'today' ? '58%' : activeTab === 'tasks' ? '56%' : activeTab === 'routine' ? '44%' : activeTab === 'analytics' ? '42%' : '50%',
                  x: '-50%'
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-10 rounded-b-full bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-l border-r border-white/20 dark:border-gray-700/30"></div>
              </motion.div>
              
              {/* First two tabs */}
              {tabs.slice(0, 2).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-white text-gray-800 shadow-lg px-4 flex-shrink-0'
                      : 'text-gray-400 hover:text-gray-300 w-12 flex-shrink-0'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {activeTab === tab.id && (
                    <span className="text-sm font-semibold whitespace-nowrap">{tab.label}</span>
                  )}
                </button>
              ))}

              {/* Spacer for center button */}
              <div className="w-16 flex-shrink-0"></div>

              {/* Last two tabs */}
              {tabs.slice(2, 4).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-white text-gray-800 shadow-lg px-4 flex-shrink-0'
                      : 'text-gray-400 hover:text-gray-300 w-12 flex-shrink-0'
                  }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  {activeTab === tab.id && (
                    <span className="text-sm font-semibold whitespace-nowrap">{tab.label}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Center Companion Button - Positioned in the notch with dynamic shift */}
            <motion.button
              onClick={() => setShowMainApp(false)}
              className="absolute -top-6 w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition-transform border-4 border-white dark:border-gray-900 z-10"
              title="Back to Companion"
              animate={{
                left: activeTab === 'today' ? '58%' : activeTab === 'tasks' ? '56%' : activeTab === 'routine' ? '44%' : activeTab === 'analytics' ? '42%' : '50%',
                x: '-50%'
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {selectedCharacter?.gender === 'Male' ? '👨' : '👩'}
            </motion.button>
          </div>
        </nav>
      </div>
    </div>
  );
}

function App() {
  return (
    <AIProvider>
      <ThemeProvider>
        <PersonalityProvider>
          <EmotionProvider>
            <AppContent />
            <Toast />
          </EmotionProvider>
        </PersonalityProvider>
      </ThemeProvider>
    </AIProvider>
  );
}

export default App;
