import { useEffect, useRef, useState } from 'react';

/**
 * Hook for ambient sounds and voice amplitude detection
 */
export const useAmbientSound = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAmbience, setCurrentAmbience] = useState('none');
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const [amplitude, setAmplitude] = useState(0);

  // Initialize Web Audio API for voice analysis
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
    }
  }, []);

  /**
   * Start analyzing microphone input for voice amplitude
   */
  const startVoiceAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAmplitude = () => {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        const normalized = average / 255;
        setAmplitude(normalized);
        
        if (isPlaying) {
          requestAnimationFrame(updateAmplitude);
        }
      };

      setIsPlaying(true);
      updateAmplitude();
      
      return () => {
        stream.getTracks().forEach(track => track.stop());
        setIsPlaying(false);
      };
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  /**
   * Play ambient sound effect
   */
  const playSound = (soundType) => {
    // Using Web Audio API to generate simple tones
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    const sounds = {
      chime: { frequency: 880, duration: 0.3, type: 'sine' },
      success: { frequency: 1046.5, duration: 0.4, type: 'triangle' },
      notification: { frequency: 523.25, duration: 0.2, type: 'sine' },
      breath: { frequency: 220, duration: 2, type: 'sine' },
      heartbeat: { frequency: 65, duration: 0.15, type: 'triangle' }
    };

    const sound = sounds[soundType] || sounds.chime;
    
    oscillator.frequency.value = sound.frequency;
    oscillator.type = sound.type;
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + sound.duration);

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + sound.duration);
  };

  /**
   * Start ambient environment sounds
   */
  const startAmbience = (type) => {
    setCurrentAmbience(type);
    // In a full implementation, this would load and play ambient audio files
    // For now, we'll use visual cues primarily
  };

  const stopAmbience = () => {
    setCurrentAmbience('none');
  };

  return {
    amplitude,
    isPlaying,
    currentAmbience,
    startVoiceAnalysis,
    playSound,
    startAmbience,
    stopAmbience
  };
};
