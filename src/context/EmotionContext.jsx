import { createContext, useContext, useState, useEffect } from 'react';

const EmotionContext = createContext();

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (!context) {
    throw new Error('useEmotion must be used within EmotionProvider');
  }
  return context;
};

/**
 * Emotion and mood tracking for immersive UI
 */
export const EmotionProvider = ({ children }) => {
  const [currentMood, setCurrentMood] = useState('neutral'); // neutral, happy, focused, tired, stressed
  const [energyLevel, setEnergyLevel] = useState(50); // 0-100
  const [breathingIntensity, setBreathingIntensity] = useState(1); // Animation speed multiplier
  const [voiceAmplitude, setVoiceAmplitude] = useState(0); // 0-1 for voice reactivity
  const [dailyVibe, setDailyVibe] = useState('balanced'); // balanced, productive, calm, chaotic
  const [emotionColor, setEmotionColor] = useState('#8B5CF6'); // Dynamic color based on mood

  // Update breathing intensity based on time of day
  useEffect(() => {
    const updateBreathing = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 9) {
        setBreathingIntensity(1.2); // Morning - more energetic
      } else if (hour >= 9 && hour < 17) {
        setBreathingIntensity(1.0); // Day - normal
      } else if (hour >= 17 && hour < 21) {
        setBreathingIntensity(0.8); // Evening - slower
      } else {
        setBreathingIntensity(0.5); // Night - very slow
      }
    };

    updateBreathing();
    const interval = setInterval(updateBreathing, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Mood-based color mapping
  useEffect(() => {
    const moodColors = {
      neutral: '#8B5CF6',   // Purple
      happy: '#F59E0B',     // Warm orange
      focused: '#3B82F6',   // Blue
      tired: '#6366F1',     // Soft indigo
      stressed: '#EF4444',  // Red
      calm: '#10B981'       // Green
    };
    
    setEmotionColor(moodColors[currentMood] || moodColors.neutral);
  }, [currentMood]);

  // Analyze daily vibe based on activities and tasks
  const analyzeDailyVibe = (activities, tasks) => {
    const totalActivities = activities.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;
    
    if (totalActivities > 15 && completedTasks > totalTasks * 0.7) {
      setDailyVibe('productive');
      setEnergyLevel(80);
    } else if (totalActivities > 0 && completedTasks > totalTasks * 0.5) {
      setDailyVibe('balanced');
      setEnergyLevel(60);
    } else if (totalActivities < 5) {
      setDailyVibe('calm');
      setEnergyLevel(30);
    } else {
      setDailyVibe('chaotic');
      setEnergyLevel(45);
    }
  };

  // Detect mood from voice tone (simplified - can be enhanced with ML)
  const detectMoodFromVoice = (amplitude, frequency) => {
    setVoiceAmplitude(amplitude);
    
    if (amplitude > 0.7) {
      setCurrentMood('happy');
      setEnergyLevel(prev => Math.min(100, prev + 5));
    } else if (amplitude < 0.3) {
      setCurrentMood('tired');
      setEnergyLevel(prev => Math.max(0, prev - 5));
    } else {
      setCurrentMood('neutral');
    }
  };

  // Manual mood setting
  const setMood = (mood) => {
    setCurrentMood(mood);
  };

  // Get emotion-based gradient
  const getEmotionGradient = () => {
    const gradients = {
      neutral: 'from-purple-500 via-pink-500 to-purple-600',
      happy: 'from-yellow-400 via-orange-500 to-pink-500',
      focused: 'from-blue-500 via-indigo-500 to-purple-600',
      tired: 'from-indigo-400 via-purple-400 to-pink-400',
      stressed: 'from-red-500 via-orange-500 to-yellow-500',
      calm: 'from-green-400 via-teal-500 to-blue-500'
    };
    
    return gradients[currentMood] || gradients.neutral;
  };

  // Get vibe-based theme
  const getVibeTheme = () => {
    const themes = {
      productive: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981',
        description: 'Sharp & Energetic'
      },
      balanced: {
        primary: '#8B5CF6',
        secondary: '#EC4899',
        accent: '#F59E0B',
        description: 'Harmonious Flow'
      },
      calm: {
        primary: '#10B981',
        secondary: '#06B6D4',
        accent: '#6366F1',
        description: 'Peaceful & Zen'
      },
      chaotic: {
        primary: '#EF4444',
        secondary: '#F59E0B',
        accent: '#EC4899',
        description: 'Dynamic & Wild'
      }
    };
    
    return themes[dailyVibe] || themes.balanced;
  };

  const value = {
    currentMood,
    energyLevel,
    breathingIntensity,
    voiceAmplitude,
    dailyVibe,
    emotionColor,
    setMood,
    setEnergyLevel,
    analyzeDailyVibe,
    detectMoodFromVoice,
    setVoiceAmplitude,
    getEmotionGradient,
    getVibeTheme
  };

  return <EmotionContext.Provider value={value}>{children}</EmotionContext.Provider>;
};
