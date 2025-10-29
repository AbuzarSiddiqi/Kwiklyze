import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacter } from '../hooks/useCharacter';
import { useStorage } from '../hooks/useStorage';
import { JournalViewer } from './AIJournal';
import { livingAI } from '../services/livingAI';

/**
 * Settings Panel - Control all immersive features
 */
const SettingsPanel = ({ onClose }) => {
  const { selectedCharacter, resetCharacter } = useCharacter();
  const [journalEntries] = useStorage('journal-entries', []);
  const [showJournal, setShowJournal] = useState(false);
  
  const [settings, setSettings] = useStorage('immersive-settings', {
    livingBackground: true,
    environmentSimulator: true,
    aiMicroMoments: true,
    journalPrompts: true,
    voiceReactive: true,
    particleEffects: true,
    emotionalColors: true,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <>
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              <span>⚙️</span>
              Immersive Settings
            </h2>
            <p className="text-white/80 mt-1">Customize your KwikLyze experience</p>
          </div>

          <div className="p-6 space-y-8">
            {/* Character Info */}
            <section>
              <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                <span>{selectedCharacter?.gender === 'Male' ? '👨' : '👩'}</span>
                Your AI Companion
              </h3>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold dark:text-white">{selectedCharacter?.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCharacter?.personality}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">🎙️ {selectedCharacter?.voice}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to change your companion? You'll return to the character selection screen.`)) {
                        resetCharacter();
                        onClose();
                      }
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Change Companion
                  </button>
                </div>
              </div>
            </section>

            {/* Feature Toggles */}
            <section>
              <h3 className="text-xl font-bold mb-4 dark:text-white">Immersive Features</h3>
              <div className="space-y-3">
                {Object.entries({
                  livingBackground: { label: 'Living Background', desc: 'Breathing gradient animations' },
                  environmentSimulator: { label: 'Environment Particles', desc: 'Sun, moon, stars, clouds' },
                  aiMicroMoments: { label: 'AI Micro Moments', desc: 'Playful AI reactions' },
                  journalPrompts: { label: 'Journal Prompts', desc: 'Thoughtful questions throughout day' },
                  voiceReactive: { label: 'Voice Reactive UI', desc: 'Particles appear when you speak' },
                  particleEffects: { label: 'Particle Effects', desc: 'Floating visual elements' },
                  emotionalColors: { label: 'Emotional Colors', desc: 'UI adapts to your mood' },
                }).map(([key, { label, desc }]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div>
                      <div className="font-medium dark:text-white">{label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
                    </div>
                    <button
                      onClick={() => toggleSetting(key)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        settings[key] ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full"
                        animate={{ x: settings[key] ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Journal Viewer */}
            <section>
              <h3 className="text-xl font-bold mb-4 dark:text-white">Your Journal</h3>
              <button
                onClick={() => setShowJournal(true)}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg transition-all"
              >
                View Journal Entries ({journalEntries.length})
              </button>
            </section>

            {/* Quick Actions */}
            <section>
              <h3 className="text-xl font-bold mb-4 dark:text-white">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => window.triggerAIMoment?.('achievement')}
                  className="p-4 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 font-medium hover:bg-green-200 dark:hover:bg-green-900/30 transition-all"
                >
                  🎉 Trigger Achievement
                </button>
                <button
                  onClick={() => window.triggerAIMoment?.('encouragement')}
                  className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 font-medium hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-all"
                >
                  💪 Get Encouragement
                </button>
                <button
                  onClick={() => window.testLivingAI?.()}
                  className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 font-medium hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-all"
                >
                  🤖 Test Groq AI
                </button>
                <button
                  onClick={() => {
                    console.log('🧠 AI State:', livingAI.state);
                    alert(`AI Mood: ${livingAI.state.mood}\nEnergy: ${livingAI.state.energy}%\nRelationship: ${livingAI.state.relationship}\nMessages: ${livingAI.state.conversationHistory.length}`);
                  }}
                  className="p-4 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 font-medium hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-all"
                >
                  🧠 AI Status
                </button>
              </div>
            </section>

            {/* AI Debug Info */}
            <section className="bg-gray-100 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-lg font-bold mb-3 dark:text-white">🤖 AI Companion Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between dark:text-gray-200">
                  <span>AI Mood:</span>
                  <span className="font-medium">{livingAI.state.mood} {livingAI.getMoodEmoji()}</span>
                </div>
                <div className="flex justify-between dark:text-gray-200">
                  <span>AI Energy:</span>
                  <span className="font-medium">{livingAI.state.energy}%</span>
                </div>
                <div className="flex justify-between dark:text-gray-200">
                  <span>Relationship:</span>
                  <span className="font-medium capitalize">{livingAI.getRelationshipLevel()}</span>
                </div>
                <div className="flex justify-between dark:text-gray-200">
                  <span>Conversations:</span>
                  <span className="font-medium">{Math.floor(livingAI.state.conversationHistory.length / 2)} exchanges</span>
                </div>
                <div className="flex justify-between dark:text-gray-200">
                  <span>API:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Groq (Llama 3.1)</span>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6 rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Close Settings
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Journal Viewer Modal */}
      <AnimatePresence>
        {showJournal && (
          <JournalViewer
            entries={journalEntries}
            onClose={() => setShowJournal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingsPanel;
