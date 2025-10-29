import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';

const characters = [
  {
    id: 'atlas',
    name: 'Atlas',
    gender: 'Male',
    personality: 'Professional & Smart',
    voice: 'Mason-PlayAI',
    voiceGender: 'male',
    language: 'english',
    description: 'Your intelligent companion who helps you stay organized and motivated',
    color: 'from-blue-600 to-purple-600',
    thumbnail: '/Male Character/Character_animestyle_friendly_202510292114_.mp4',
    videos: {
      idle: '/Male Character/Character_animestyle_friendly_202510292114_.mp4',
      listening: '/Male Character/Attentive_listening_pose_202510292115_v18jo.mp4',
      talking: '/Male Character/Natural_talking_animation_202510292115_15dis.mp4',
      happy: '/Male Character/Joyful_celebration_animation_202510292115_fl.mp4',
      thinking: '/Male Character/Thoughtful_contemplative_expression_20251029.mp4',
    }
  },
  {
    id: 'luna',
    name: 'Luna',
    gender: 'Female',
    personality: 'Warm & Supportive',
    voice: 'Ruby-PlayAI',
    voiceGender: 'female',
    language: 'english',
    description: 'Your caring companion who supports you through every step of your journey',
    color: 'from-pink-500 to-purple-500',
    thumbnail: '/Female Character/Heres_your_prompt_202510292124_ngezm.mp4',
    videos: {
      idle: '/Female Character/Heres_your_prompt_202510292124_ngezm.mp4',
      listening: '/Female Character/Attentive_caring_listening_202510292124_lkz68.mp4',
      talking: '/Female Character/Natural_expressive_talking_202510292124_xy590.mp4',
      happy: '/Female Character/_joyful_celebration_202510292124_vtiw5.mp4',
      thinking: '/Female Character/Thoughtful_curious_expression_202510292124_2.mp4',
    }
  }
];

export default function CharacterSelector({ onSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const dragX = useMotionValue(0);

  const onDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) >= 500 || Math.abs(offset) >= 100) {
      if (offset > 0) {
        // Swiped right - go to previous
        setCurrentIndex((prev) => (prev - 1 + characters.length) % characters.length);
      } else {
        // Swiped left - go to next
        setCurrentIndex((prev) => (prev + 1) % characters.length);
      }
    }
  };

  const handleSelect = () => {
    const character = characters[currentIndex];
    setSelectedCharacter(character);
    setTimeout(() => {
      onSelect(character);
    }, 800);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % characters.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + characters.length) % characters.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center pt-8 pb-4"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Choose Your Companion
          </h1>
          <p className="text-white/70 text-sm sm:text-lg">
            Swipe to explore • Tap to select
          </p>
        </motion.div>

        {/* Circular Ring Carousel */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* Circular indicator dots in ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px]">
              {characters.map((char, index) => {
                const angle = ((index - currentIndex) / characters.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 140; // Distance from center
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                return (
                  <motion.div
                    key={char.id}
                    className="absolute w-3 h-3 rounded-full bg-white/30"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: x,
                      y: y,
                      scale: index === currentIndex ? 1.5 : 1,
                      opacity: index === currentIndex ? 1 : 0.3,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                );
              })}
              
              {/* Ring circle */}
              <motion.div
                className="absolute inset-0 border-2 border-white/10 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              />
            </div>
          </div>

          {/* Character Cards Carousel */}
          <div className="relative w-full max-w-md">
            <AnimatePresence mode="wait" custom={currentIndex}>
              <motion.div
                key={currentIndex}
                custom={currentIndex}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={onDragEnd}
                style={{ x: dragX }}
                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="cursor-grab active:cursor-grabbing"
              >
                <CharacterCard 
                  character={characters[currentIndex]} 
                  onSelect={handleSelect}
                  isSelected={selectedCharacter?.id === characters[currentIndex].id}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl hover:bg-white/20 transition-all z-20"
          >
            ‹
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl sm:text-3xl hover:bg-white/20 transition-all z-20"
          >
            ›
          </button>
        </div>

        {/* Character Info */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pb-8"
        >
          <div className={`inline-block px-6 py-2 rounded-full bg-gradient-to-r ${characters[currentIndex].color} text-white text-sm font-medium mb-2`}>
            {characters[currentIndex].personality}
          </div>
          <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto px-4">
            {characters[currentIndex].description}
          </p>
        </motion.div>

        {/* Loading State */}
        {selectedCharacter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mx-auto mb-4"
              />
              <p className="text-white text-xl font-medium">
                Loading {selectedCharacter.name}...
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Character Card Component
function CharacterCard({ character, onSelect, isSelected }) {
  return (
    <div className="relative">
      <motion.div
        whileTap={{ scale: 0.95 }}
        className="relative overflow-hidden rounded-3xl bg-black/40 backdrop-blur-xl border-2 border-white/20 shadow-2xl"
      >
        {/* Video Background */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <video
            src={character.thumbnail}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${character.color} opacity-20`} />
          
          {/* Bottom Info Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>

        {/* Character Info */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${character.color} flex items-center justify-center text-3xl shadow-lg`}>
              {character.gender === 'Male' ? '👨' : '👩'}
            </div>
            <div>
              <h3 className="text-3xl sm:text-4xl font-bold text-white">
                {character.name}
              </h3>
              <p className="text-white/70 text-sm">{character.gender} Companion</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/60 text-xs mb-4">
            <span>🎙️</span>
            <span>{character.voice}</span>
          </div>

          {/* Select Button */}
          <motion.button
            onClick={onSelect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
              isSelected
                ? 'bg-white text-purple-900'
                : `bg-gradient-to-r ${character.color} text-white`
            }`}
          >
            {isSelected ? '✓ Selected' : 'Select Companion'}
          </motion.button>
        </div>
      </motion.div>

      {/* Swipe Hint */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white/50 text-sm flex items-center gap-2"
      >
        <span>←</span>
        <span>Swipe</span>
        <span>→</span>
      </motion.div>
    </div>
  );
}
