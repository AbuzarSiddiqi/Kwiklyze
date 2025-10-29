import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedCharacter({ character, state = 'idle', className = '' }) {
  const videoRef = useRef(null);
  const currentVideoSrc = character?.videos?.[state] || character?.videos?.idle;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      // For talking state, always start from 2 seconds to skip idle intro
      if (state === 'talking') {
        video.currentTime = 2;
        console.log('🎬 Video loaded, starting from 2 seconds for talking state');
      }
    };

    const handleCanPlay = () => {
      // Double-check the time is set for talking state
      if (state === 'talking' && video.currentTime < 2) {
        video.currentTime = 2;
        console.log('🎬 Adjusted to 2 seconds on canplay');
      }
    };

    video.load();
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay, { once: true });
    
    video.play().catch(err => {
      console.log('Video autoplay prevented:', err);
    });

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentVideoSrc, state]);

  // Handle video loop - always loop from 2 seconds for talking state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (state === 'talking') {
        video.currentTime = 2; // Always loop back to 2 seconds
        video.play();
      }
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [state]);

  if (!character) return null;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        key={state}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full h-full"
      >
        <video
          ref={videoRef}
          src={currentVideoSrc}
          loop
          muted
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Character Name Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20"
        >
          <span className="text-white font-medium text-sm flex items-center gap-2">
            {character.gender === 'Male' ? '👨' : '👩'} {character.name}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
