import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Dynamic environment simulation based on time and weather
 */
const EnvironmentSimulator = ({ timeOfDay }) => {
  const [weather, setWeather] = useState('clear'); // clear, cloudy, rainy, starry
  const [particles, setParticles] = useState([]);

  // Generate environment particles based on time and weather
  useEffect(() => {
    const generateParticles = () => {
      const particleCount = timeOfDay === 'night' ? 50 : 30;
      const newParticles = [];

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          duration: Math.random() * 10 + 5,
          delay: Math.random() * 5
        });
      }

      setParticles(newParticles);
    };

    generateParticles();
  }, [timeOfDay, weather]);

  // Particle type based on time and weather
  const getParticleType = () => {
    if (weather === 'rainy') return 'rain';
    if (timeOfDay === 'night') return 'stars';
    if (timeOfDay === 'morning') return 'sparkles';
    return 'dust';
  };

  const particleType = getParticleType();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Sun rays (morning/noon) */}
      {(timeOfDay === 'morning' || timeOfDay === 'noon') && weather === 'clear' && (
        <div className="absolute top-0 right-0 w-1/3 h-1/3">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`ray-${i}`}
              className="absolute top-0 right-0 w-1 bg-gradient-to-b from-yellow-300/30 to-transparent origin-top-right"
              style={{
                height: '100%',
                transform: `rotate(${i * 15}deg)`,
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            particleType === 'stars' ? 'bg-white' :
            particleType === 'rain' ? 'bg-blue-300/60' :
            particleType === 'sparkles' ? 'bg-yellow-200' :
            'bg-white/20'
          }`}
          style={{
            left: `${particle.x}%`,
            top: particleType === 'rain' ? '-5%' : `${particle.y}%`,
            width: `${particle.size}px`,
            height: particleType === 'rain' ? `${particle.size * 4}px` : `${particle.size}px`,
          }}
          animate={{
            y: particleType === 'rain' ? ['0vh', '110vh'] : ['0px', '20px', '0px'],
            x: particleType === 'rain' ? [0, -30] : [0, 10, 0],
            opacity: particleType === 'stars' ? [0.5, 1, 0.5] : [0.3, 0.6, 0.3],
            scale: particleType === 'sparkles' ? [1, 1.5, 1] : 1,
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: particleType === 'rain' ? 'linear' : 'easeInOut',
          }}
        />
      ))}

      {/* Moon (night) */}
      {timeOfDay === 'night' && (
        <motion.div
          className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-full shadow-2xl"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Moon glow */}
          <div className="absolute inset-0 bg-yellow-200/30 rounded-full blur-xl scale-150" />
        </motion.div>
      )}

      {/* Cloud formations */}
      {(weather === 'cloudy' || weather === 'rainy') && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute bg-white/10 backdrop-blur-sm rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${10 + i * 15}%`,
                width: `${100 + i * 50}px`,
                height: `${40 + i * 20}px`,
              }}
              animate={{
                x: [-50, 50, -50],
              }}
              transition={{
                duration: 30 + i * 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default EnvironmentSimulator;
