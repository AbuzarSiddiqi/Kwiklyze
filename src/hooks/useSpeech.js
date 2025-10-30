import { useState, useEffect, useRef, useCallback } from 'react';
import Groq from 'groq-sdk';

// ElevenLabs API configuration with multiple keys from environment variables
const ELEVENLABS_API_KEYS = [
  import.meta.env.VITE_ELEVENLABS_API_KEY_1,
  import.meta.env.VITE_ELEVENLABS_API_KEY_2,
  import.meta.env.VITE_ELEVENLABS_API_KEY_3,
  import.meta.env.VITE_ELEVENLABS_API_KEY_4,
  import.meta.env.VITE_ELEVENLABS_API_KEY_5
].filter(Boolean); // Remove undefined values

let currentElevenLabsKeyIndex = 0;

// ElevenLabs voices - organized by gender and language
const ELEVENLABS_VOICES = {
  // Female voices
  'female-english': 'EXAVITQu4vr4xnSDxMaL', // Rachel - warm female English voice
  'female-hindi': 'EXAVITQu4vr4xnSDxMaL',   // Rachel (speaks Hindi with multilingual model)
  
  // Male voices
  'male-english': 'TxGEqnHWrfWFTfGW9XjX',   // Josh - professional male English voice
  'male-hindi': 'TxGEqnHWrfWFTfGW9XjX',     // Josh (speaks Hindi with multilingual model)
  
  // Legacy mapping for backward compatibility
  'Ruby-PlayAI': 'EXAVITQu4vr4xnSDxMaL',   // Rachel - warm female voice
  'Mason-PlayAI': 'TxGEqnHWrfWFTfGW9XjX',  // Josh - professional male voice
};

// Multiple API keys for TTS with automatic failover from environment variables
const TTS_API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY_1,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3
].filter(Boolean); // Remove undefined values

let currentTTSKeyIndex = 0;

// Initialize Groq client for TTS (lazy initialization to handle empty keys)
let groq = null;
const initializeGroq = () => {
  if (!groq && TTS_API_KEYS.length > 0 && TTS_API_KEYS[currentTTSKeyIndex]) {
    groq = new Groq({
      apiKey: TTS_API_KEYS[currentTTSKeyIndex],
      dangerouslyAllowBrowser: true
    });
    console.log('🎤 TTS initialized with API key #' + (currentTTSKeyIndex + 1));
  }
  return groq;
};

console.log('🎤 TTS ready with ElevenLabs (5 keys) + PlayAI fallback (3 keys)');

/**
 * Hook for Speech - PlayAI TTS from Groq + Web Speech Recognition
 */
export const useSpeech = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const isSpeakingRef = useRef(false); // Track if already speaking to prevent overlaps
  const lastTextRef = useRef(''); // Track last spoken text to prevent duplicates

  // Request microphone permission on mount
  useEffect(() => {
    const requestMicPermission = async () => {
      try {
        // Request microphone access - this will persist the permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream immediately - we just needed to get permission
        stream.getTracks().forEach(track => track.stop());
        setHasPermission(true);
        console.log('🎤 Microphone permission granted and persisted');
      } catch (err) {
        console.warn('⚠️ Microphone permission denied:', err);
        setHasPermission(false);
      }
    };

    requestMicPermission();
  }, []);

  useEffect(() => {
    // Check browser support for speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const supported = !!SpeechRecognition;
    setIsSupported(supported);

    if (supported) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionRef.current.onerror = (event) => {
        setError(event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  /**
   * Start listening for speech
   */
  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    setTranscript('');
    setError(null);
    setIsListening(true);
    recognitionRef.current.start();
  }, [isSupported]);

  /**
   * Stop listening
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  /**
   * Detect if text contains Hindi/Hinglish
   */
  const detectLanguage = (text) => {
    // Check for Devanagari Unicode range (Hindi script)
    const hindiPattern = /[\u0900-\u097F]/;
    if (hindiPattern.test(text)) {
      return 'hindi';
    }
    
    // Check for common Hinglish words/patterns (Hindi written in Roman script)
    const hinglishWords = [
      // Question words
      'kya', 'kaise', 'kahan', 'kab', 'kyun', 'kyunki', 'kaun', 'kisko',
      // Common verbs
      'hai', 'hoon', 'ho', 'hain', 'kar', 'karna', 'karo', 'kare', 'karta', 'karti',
      'raha', 'rahe', 'rahi', 'tha', 'thi', 'the', 'hai', 'ho',
      'gaya', 'gayi', 'gaye', 'diya', 'liya', 'kiya', 'dekha', 'suna',
      'aaya', 'aayi', 'aaye', 'jaana', 'aana', 'dena', 'lena',
      // Pronouns
      'main', 'mein', 'hum', 'tum', 'aap', 'yeh', 'ye', 'woh', 'wo', 'koi', 'kuch',
      'inka', 'unka', 'mera', 'tera', 'uska', 'apna',
      // Common words
      'nahi', 'nahin', 'mat', 'haan', 'ji', 'theek', 'thik', 'sahi', 
      'achha', 'accha', 'acha', 'badhiya', 'badiya',
      'abhi', 'ab', 'phir', 'fir', 'bhi', 'aur', 'ya', 'lekin', 'par',
      // Prepositions
      'ki', 'ke', 'ko', 'ka', 'ne', 'se', 'par', 'pe', 'mein', 'me',
      // Time/place
      'kal', 'aaj', 'raat', 'din', 'subah', 'sham', 'dopahar',
      'samay', 'baad', 'pehle', 'pahle', 'sabhi', 'sab',
      // Slang/casual
      'arre', 'are', 'yaar', 'dost', 'bhai', 'bas', 'chal', 'chalo',
      'karo', 'karna', 'hota', 'hoti', 'hote',
      // Common phrases
      'kya baat', 'thik hai', 'ho gaya', 'kar raha', 'kar rahe',
      'mujhe', 'tumhe', 'usse', 'isse', 'unhe', 'inhe',
      'bahut', 'bohot', 'thoda', 'jyada', 'zyada', 'kam', 'sabse'
    ];
    
    // Convert to lowercase and check for Hinglish words
    const lowerText = text.toLowerCase();
    const wordsInText = lowerText.match(/\b\w+\b/g) || [];
    
    // Count Hinglish word matches
    const hinglishMatches = wordsInText.filter(word => 
      hinglishWords.includes(word)
    ).length;
    
    // Lower threshold to 15% for better detection, or if 2+ Hinglish words found
    const hinglishRatio = hinglishMatches / Math.max(wordsInText.length, 1);
    
    return (hinglishRatio > 0.15 || hinglishMatches >= 2) ? 'hindi' : 'english';
  };

  /**
   * Speak text using ElevenLabs TTS (with PlayAI and Web Speech fallback)
   */
  const speak = useCallback(async (text, options = {}) => {
    // Prevent duplicate speech requests
    if (isSpeakingRef.current && lastTextRef.current === text) {
      console.log('⚠️ Duplicate speech request detected, ignoring...');
      return;
    }
    
    // Prevent overlapping speech
    if (isSpeakingRef.current) {
      console.log('⚠️ Already speaking, canceling previous audio...');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
    
    lastTextRef.current = text;
    isSpeakingRef.current = true;
    console.log('🔊 TTS requested for:', text);
    setIsSpeaking(true);
    setError(null);

    // Stop any currently playing audio and cancel Web Speech
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      // Try ElevenLabs first
      console.log('🎙️ Attempting ElevenLabs TTS...');
      console.log('🔑 Using ElevenLabs API key #' + (currentElevenLabsKeyIndex + 1));
      
      // Auto-detect language from text, or use provided language
      const detectedLanguage = detectLanguage(text);
      const language = options.language || detectedLanguage;
      const gender = options.gender || 'female';
      const voiceKey = `${gender}-${language}`;
      
      const voiceId = ELEVENLABS_VOICES[voiceKey] || ELEVENLABS_VOICES[options.voice] || ELEVENLABS_VOICES['female-english'];
      console.log(`🎤 Auto-detected language: ${detectedLanguage} | Using: ${gender} ${language} (ID: ${voiceId})`);
      
      // Use multilingual model for Hindi, monolingual for English
      const modelId = language === 'hindi' ? 'eleven_multilingual_v2' : 'eleven_monolingual_v1';
      console.log('🌐 Using model:', modelId);
      
      const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEYS[currentElevenLabsKeyIndex]
        },
        body: JSON.stringify({
          text: text,
          model_id: modelId,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (elevenLabsResponse.ok) {
        console.log('✅ ElevenLabs TTS response received');
        // Reset key index on success so next request starts from key #1
        currentElevenLabsKeyIndex = 0;
        const audioBlob = await elevenLabsResponse.blob();
        console.log('🎵 Audio blob created, size:', audioBlob.size);
        
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onplay = () => {
          console.log('🎵 Audio playback started');
          if (options.onStart) options.onStart();
        };
        audioRef.current.onended = () => {
          console.log('🎵 Audio playback ended');
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          if (options.onEnd) options.onEnd();
        };
        audioRef.current.onerror = (err) => {
          console.error('❌ Audio playback error:', err);
          setError('Audio playback failed');
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          if (options.onEnd) options.onEnd();
        };
        
        console.log('▶️ Starting ElevenLabs audio playback...');
        await audioRef.current.play();
        console.log('🎵 ElevenLabs audio started successfully - EXITING to prevent fallback');
        return; // Success! Exit early
      } else {
        // Log the error details
        console.warn('❌ ElevenLabs API error status:', elevenLabsResponse.status);
        let errorDetails = null;
        try {
          errorDetails = await elevenLabsResponse.json();
          console.warn('❌ ElevenLabs error details:', errorDetails);
        } catch (e) {
          console.warn('⚠️ Could not parse ElevenLabs error response');
        }
        
        // Check if it's a rate limit error (429 or quota exceeded)
        const isRateLimit = elevenLabsResponse.status === 429 || 
                           elevenLabsResponse.status === 401;
        
        if (isRateLimit) {
          // Try all remaining API keys
          while (currentElevenLabsKeyIndex < ELEVENLABS_API_KEYS.length - 1) {
            console.log('⚠️ ElevenLabs Rate limit detected! Switching to next API key...');
            currentElevenLabsKeyIndex++;
            console.log('🔄 Switching to ElevenLabs API key #' + (currentElevenLabsKeyIndex + 1));
            
            // Retry with new ElevenLabs API key
            const retryElevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
              method: 'POST',
              headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEYS[currentElevenLabsKeyIndex]
              },
              body: JSON.stringify({
                text: text,
                model_id: modelId,  // Use same model as first attempt
                voice_settings: {
                  stability: 0.5,
                  similarity_boost: 0.75
                }
              })
            });
            
            if (retryElevenLabsResponse.ok) {
              console.log('✅ ElevenLabs retry successful with API key #' + (currentElevenLabsKeyIndex + 1) + '!');
              // Reset key index on success so next request starts from key #1
              currentElevenLabsKeyIndex = 0;
              const audioBlob = await retryElevenLabsResponse.blob();
              console.log('🎵 Audio blob created, size:', audioBlob.size);
              
              const audioUrl = URL.createObjectURL(audioBlob);
              audioRef.current = new Audio(audioUrl);
              audioRef.current.onplay = () => {
                console.log('🎵 Audio playback started');
                if (options.onStart) options.onStart();
              };
              audioRef.current.onended = () => {
                console.log('🎵 Audio playback ended');
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                if (options.onEnd) options.onEnd();
              };
              audioRef.current.onerror = (err) => {
                console.error('❌ Audio playback error:', err);
                setError('Audio playback failed');
                isSpeakingRef.current = false;
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
                if (options.onEnd) options.onEnd();
              };
              
              console.log('▶️ Starting ElevenLabs audio playback...');
              await audioRef.current.play();
              console.log('🎵 ElevenLabs retry audio started successfully - EXITING to prevent fallback');
              return; // Success! Exit early
            } else {
              console.warn('❌ ElevenLabs retry error status:', retryElevenLabsResponse.status);
              let retryErrorDetails = null;
              try {
                retryErrorDetails = await retryElevenLabsResponse.json();
                console.warn('❌ ElevenLabs retry error details:', retryErrorDetails);
              } catch (e) {
                console.warn('⚠️ Could not parse ElevenLabs retry error response');
              }
              // Continue loop to try next key
            }
          }
          
          console.warn('❌ All ElevenLabs API keys exhausted, falling back to PlayAI');
        }
        
        console.warn('⚠️ ElevenLabs failed, trying PlayAI...');
      }
    } catch (elevenLabsErr) {
      console.warn('⚠️ ElevenLabs error:', elevenLabsErr.message);
    }

    // Fallback to PlayAI (only reached if ElevenLabs completely failed)
    console.log('🌐 Falling back to Groq PlayAI TTS...');
    
    try {
      console.log('�️ Attempting Groq PlayAI TTS...');
      console.log('🔑 Using TTS API key #' + (currentTTSKeyIndex + 1));
      
      // Call Groq Audio API for TTS
      const audioResponse = await fetch('https://api.groq.com/openai/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TTS_API_KEYS[currentTTSKeyIndex]}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'playai-tts',
          input: text,
          voice: options.voice || 'Ruby-PlayAI', // PlayAI voices require -PlayAI suffix
          response_format: 'mp3',
          speed: options.rate || 1.0
        })
      });

      console.log('📡 TTS Response status:', audioResponse.status);
      console.log('📡 Response ok?', audioResponse.ok);

      if (!audioResponse.ok) {
        console.warn('🔴 TTS API returned non-OK status, reading error...');
        let errorText = 'Unknown error';
        let errorData = null;
        
        try {
          errorText = await audioResponse.text();
          console.warn('🔴 Error text received:', errorText);
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.warn('⚠️ Could not read error response:', e);
        }
        
        // Check if it's a rate limit error
        const isRateLimit = audioResponse.status === 429 || 
                           (errorData?.error?.code === 'rate_limit_exceeded');
        
        if (isRateLimit && currentTTSKeyIndex < TTS_API_KEYS.length - 1) {
          console.log('⚠️ TTS Rate limit detected! Switching to next API key...');
          currentTTSKeyIndex++;
          console.log('🔄 Switching to TTS API key #' + (currentTTSKeyIndex + 1));
          
          // Retry with new API key
          const retryResponse = await fetch('https://api.groq.com/openai/v1/audio/speech', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${TTS_API_KEYS[currentTTSKeyIndex]}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'playai-tts',
              input: text,
              voice: options.voice || 'Ruby-PlayAI',
              response_format: 'mp3',
              speed: options.rate || 1.0
            })
          });
          
          if (retryResponse.ok) {
            console.log('✅ TTS retry successful with new API key!');
            const audioBlob = await retryResponse.blob();
            console.log('🎵 Audio blob created, size:', audioBlob.size);
            
            const audioUrl = URL.createObjectURL(audioBlob);
            audioRef.current = new Audio(audioUrl);
            audioRef.current.onplay = () => {
              console.log('🎵 Audio playback started');
              if (options.onStart) options.onStart();
            };
            audioRef.current.onended = () => {
              console.log('🎵 Audio playback ended');
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              if (options.onEnd) options.onEnd();
            };
            audioRef.current.onerror = (err) => {
              console.error('❌ Audio playback error:', err);
              setError('Audio playback failed');
              isSpeakingRef.current = false;
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
              if (options.onEnd) options.onEnd();
            };
            
            console.log('▶️ Starting audio playback...');
            await audioRef.current.play();
            return;
          } else {
            console.warn('❌ TTS retry also hit rate limit, falling back to Web Speech');
          }
        }
        
        console.warn('❌ TTS API error response:', errorText);
        console.warn('❌ TTS Request details:', {
          url: 'https://api.groq.com/openai/v1/audio/speech',
          model: 'playai-tts',
          voice: options.voice || 'Ruby-PlayAI',
          textLength: text.length,
          textPreview: text.substring(0, 100)
        });
        throw new Error(`TTS API error: ${audioResponse.status} - ${errorText}`);
      }

      console.log('✅ PlayAI TTS response received');

      // Convert response to audio blob
      const audioBlob = await audioResponse.blob();
      console.log('🎵 Audio blob created, size:', audioBlob.size);
      
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onplay = () => {
        console.log('🎵 Audio playback started');
        if (options.onStart) options.onStart();
      };
      audioRef.current.onended = () => {
        console.log('🎵 Audio playback ended');
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (options.onEnd) options.onEnd();
      };
      audioRef.current.onerror = (err) => {
        console.error('❌ Audio playback error:', err);
        setError('Audio playback failed');
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        if (options.onEnd) options.onEnd();
      };

      console.log('▶️ Starting audio playback...');
      await audioRef.current.play();

    } catch (err) {
      console.warn('🔴 PlayAI TTS Error caught:', err.message);
      console.warn('🔴 Full error object:', err);
      console.warn('🔴 Error stack:', err.stack);
      
      // Fallback to Web Speech API
      console.log('⚠️ Falling back to Web Speech API');
      try {
        if (!window.speechSynthesis) {
          throw new Error('Speech synthesis not supported');
        }

        window.speechSynthesis.cancel(); // Clear any pending speech
        
        // Small delay to ensure cancel completes
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || 0.95; // Slightly slower for better clarity
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;
        utterance.lang = options.lang || 'en-US';
        
        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Victoria'));
        if (femaleVoice) {
          utterance.voice = femaleVoice;
          console.log('🎤 Using voice:', femaleVoice.name);
        }
        
        utterance.onstart = () => {
          console.log('🗣️ Web Speech started');
          if (options.onStart) options.onStart();
        };
        utterance.onend = () => {
          console.log('🗣️ Web Speech ended');
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          if (options.onEnd) options.onEnd();
        };
        utterance.onerror = (event) => {
          console.error('🗣️ Web Speech error:', event);
          setError(event.error);
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          if (options.onEnd) options.onEnd();
        };

        window.speechSynthesis.speak(utterance);
        console.log('✅ Web Speech fallback activated');
        
      } catch (fallbackErr) {
        console.error('❌ Web Speech fallback also failed:', fallbackErr);
        setError('Speech synthesis not available');
        isSpeakingRef.current = false;
        setIsSpeaking(false);
      }
    }
  }, []);

  /**
   * Stop speaking
   */
  const stopSpeaking = useCallback(() => {
    console.log('🛑 Stopping all speech...');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    error,
    isSupported,
    hasPermission,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript: () => setTranscript('')
  };
};
