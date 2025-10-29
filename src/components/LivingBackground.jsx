import { motion } from 'framer-motion';
import { useEmotion } from '../context/EmotionContext';

/**
 * Living background that breathes and reacts to voice
 */
const LivingBackground = ({ children }) => {
  const { breathingIntensity, voiceAmplitude, getEmotionGradient } = useEmotion();

  // Breathing animation that pulses based on time of day
  const breathingScale = 1 + (voiceAmplitude * 0.1);
  const animationDuration = 4 / breathingIntensity;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className={`fixed inset-0 bg-gradient-to-br ${getEmotionGradient()}`}
        animate={{
          scale: [1, breathingScale, 1],
          opacity: [0.95, 1, 0.95],
        }}
        transition={{
          duration: animationDuration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Voice-reactive particles */}
      {voiceAmplitude > 0.1 && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(Math.floor(voiceAmplitude * 20))].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, voiceAmplitude, 0],
                scale: [0, 1, 0],
                y: [-20, -100],
              }}
              transition={{
                duration: 2,
                delay: i * 0.05,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Ambient light orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
          style={{ left: '10%', top: '20%' }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl"
          style={{ right: '10%', bottom: '20%' }}
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default LivingBackground;
