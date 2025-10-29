import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEmotion } from '../context/EmotionContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

/**
 * Emotion Graph Fusion - Combines mood, energy, voice amplitude, and activity into one emotional timeline
 */
const EmotionGraphFusion = ({ activities = [] }) => {
  const { currentMood, energyLevel, voiceAmplitude, getEmotionGradient, getEmotionColor } = useEmotion();
  const [emotionTimeline, setEmotionTimeline] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Build emotion timeline from activities and emotion context
  useEffect(() => {
    const buildTimeline = () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const timeline = [];

      // Create hourly data points
      for (let hour = 0; hour < 24; hour++) {
        const time = new Date(startOfDay.getTime() + hour * 3600000);
        const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Find activities in this hour
        const hourActivities = activities.filter(a => {
          const activityTime = new Date(a.timestamp);
          return activityTime.getHours() === hour && 
                 activityTime.toDateString() === now.toDateString();
        });

        // Calculate metrics
        const activityCount = hourActivities.length;
        const totalDuration = hourActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
        
        // Mood score (0-100)
        let moodScore = 50; // baseline
        if (hour === now.getHours()) {
          moodScore = getMoodScore(currentMood);
        } else if (hourActivities.length > 0) {
          // Estimate mood from activity types
          moodScore = estimateMoodFromActivities(hourActivities);
        }

        // Energy score (0-100)
        let energyScore = 50; // baseline
        if (hour === now.getHours()) {
          energyScore = energyLevel;
        } else {
          // Natural energy curve (low at night, high midday)
          energyScore = getBaselineEnergy(hour) + (activityCount * 5);
        }

        // Voice activity (0-100)
        const voiceScore = hour === now.getHours() ? voiceAmplitude * 100 : 0;

        // Composite emotional score
        const emotionalScore = (moodScore * 0.4 + energyScore * 0.4 + voiceScore * 0.2);

        timeline.push({
          time: timeStr,
          hour,
          mood: Math.round(moodScore),
          energy: Math.round(energyScore),
          voice: Math.round(voiceScore),
          emotional: Math.round(emotionalScore),
          activities: activityCount,
          duration: totalDuration,
        });
      }

      setEmotionTimeline(timeline);
    };

    buildTimeline();
    const interval = setInterval(buildTimeline, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activities, currentMood, energyLevel, voiceAmplitude]);

  const getMoodScore = (mood) => {
    const scores = {
      happy: 90,
      excited: 95,
      calm: 70,
      neutral: 50,
      tired: 30,
      stressed: 25,
      sad: 15,
    };
    return scores[mood] || 50;
  };

  const estimateMoodFromActivities = (acts) => {
    const categoryMoodBoost = {
      health: 20,
      social: 25,
      leisure: 30,
      personal: 15,
      work: 0,
    };

    const avgBoost = acts.reduce((sum, a) => 
      sum + (categoryMoodBoost[a.category] || 0), 0) / acts.length;
    
    return 50 + avgBoost;
  };

  const getBaselineEnergy = (hour) => {
    // Natural circadian rhythm
    if (hour < 6 || hour > 22) return 20; // Sleep
    if (hour < 9) return 40; // Morning
    if (hour < 12) return 70; // Late morning
    if (hour < 14) return 60; // Lunch
    if (hour < 17) return 75; // Afternoon
    if (hour < 20) return 55; // Evening
    return 35; // Night
  };

  const metrics = [
    { id: 'all', label: 'Emotional Score', color: '#a855f7', key: 'emotional' },
    { id: 'mood', label: 'Mood', color: '#ec4899', key: 'mood' },
    { id: 'energy', label: 'Energy', color: '#f59e0b', key: 'energy' },
    { id: 'voice', label: 'Voice Activity', color: '#3b82f6', key: 'voice' },
  ];

  const activeMetric = metrics.find(m => m.id === selectedMetric);

  return (
    <div className="space-y-4">
      {/* Metric selector */}
      <div className="flex gap-2 flex-wrap">
        {metrics.map(metric => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedMetric === metric.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Current emotion status */}
      <div className={`rounded-xl bg-gradient-to-r ${getEmotionGradient()} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Right Now</h3>
            <div className="space-y-1">
              <p className="text-sm opacity-90">
                Mood: <span className="font-semibold capitalize">{currentMood}</span>
              </p>
              <p className="text-sm opacity-90">
                Energy: <span className="font-semibold">{energyLevel}%</span>
              </p>
              <p className="text-sm opacity-90">
                Voice Activity: <span className="font-semibold">{Math.round(voiceAmplitude * 100)}%</span>
              </p>
            </div>
          </div>
          
          {/* Pulsing emotion indicator */}
          <motion.div
            className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <span className="text-4xl">
              {currentMood === 'happy' && '😊'}
              {currentMood === 'excited' && '🤩'}
              {currentMood === 'calm' && '😌'}
              {currentMood === 'neutral' && '😐'}
              {currentMood === 'tired' && '😴'}
              {currentMood === 'stressed' && '😰'}
              {currentMood === 'sad' && '😢'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Emotion timeline graph */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 dark:text-white">
          {activeMetric.label} Timeline
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={emotionTimeline}>
            <defs>
              <linearGradient id="emotionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={activeMetric.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={activeMetric.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="#888"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#888"
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value, name) => [Math.round(value), activeMetric.label]}
            />
            <Area 
              type="monotone" 
              dataKey={activeMetric.key}
              stroke={activeMetric.color}
              strokeWidth={3}
              fill="url(#emotionGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Peak Energy',
            value: `${Math.max(...emotionTimeline.map(t => t.energy))}%`,
            icon: '⚡',
            color: 'from-yellow-400 to-orange-500',
          },
          {
            label: 'Best Mood',
            value: `${Math.max(...emotionTimeline.map(t => t.mood))}%`,
            icon: '😊',
            color: 'from-pink-400 to-purple-500',
          },
          {
            label: 'Most Active',
            value: `${Math.max(...emotionTimeline.map(t => t.activities))} activities`,
            icon: '🔥',
            color: 'from-red-400 to-pink-500',
          },
        ].map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-r ${insight.color} rounded-xl p-4 text-white`}
          >
            <div className="text-3xl mb-2">{insight.icon}</div>
            <div className="text-2xl font-bold">{insight.value}</div>
            <div className="text-sm opacity-90">{insight.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default EmotionGraphFusion;
