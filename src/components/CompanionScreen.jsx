import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useCharacter } from '../hooks/useCharacter';
import { useSpeech } from '../hooks/useSpeech';
import { livingAI } from '../services/livingAI';
import AnimatedCharacter from './AnimatedCharacter';

// Characters data
const characters = [
  {
    id: 'atlas',
    name: 'Atlas',
    gender: 'Male',
    personality: 'Professional & Smart',
    voice: 'Mason-PlayAI',
    voiceGender: 'male',
    language: 'english', // Default language, can be changed in settings
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
    language: 'english', // Default language, can be changed in settings
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

export default function CompanionScreen({ 
  onOpenApp, 
  activities = [], 
  tasks = [], 
  routine = [],
  onAddActivity,
  onUpdateActivity,
  onAddTask,
  onUpdateTask,
  onUpdateRoutine 
}) {
  const { selectedCharacter, selectCharacter, characterState, changeState } = useCharacter();
  const { speak, startListening, stopListening, isListening, transcript, resetTranscript } = useSpeech();
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showCharacterSwitch, setShowCharacterSwitch] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const dragX = useMotionValue(0);

  // Get current character index
  const getCurrentIndex = () => {
    return characters.findIndex(char => char.id === selectedCharacter?.id);
  };

  // Handle character swipe
  const onDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) >= 500 || Math.abs(offset) >= 100) {
      const currentIndex = getCurrentIndex();
      let newIndex;
      
      if (offset > 0) {
        // Swiped right - go to previous
        newIndex = (currentIndex - 1 + characters.length) % characters.length;
      } else {
        // Swiped left - go to next
        newIndex = (currentIndex + 1) % characters.length;
      }
      
      switchCharacter(newIndex);
    }
  };

  const switchCharacter = (newIndex) => {
    const newCharacter = characters[newIndex];
    setShowCharacterSwitch(true);
    
    // Stop any ongoing speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Clear messages and reset state
    setMessages([]);
    setCurrentMessage('');
    changeState('idle');
    
    setTimeout(() => {
      selectCharacter(newCharacter);
      setShowCharacterSwitch(false);
      
      // Generate AI greeting with new character
      setTimeout(async () => {
        try {
          const greeting = await livingAI.generateResponse(
            `Introduce yourself as ${newCharacter.name}. Keep it brief and friendly (1-2 sentences). Show your personality!`,
            { timeOfDay: getTimeOfDay() }
          );
          setCurrentMessage(greeting);
          setMessages([{ role: 'assistant', content: greeting }]);
          speak(greeting, { 
            voice: newCharacter.voice,
            gender: newCharacter.voiceGender,
            onStart: () => changeState('talking'),
            onEnd: () => changeState('idle')
          });
        } catch (error) {
          console.error('Error generating greeting:', error);
          const fallbackGreeting = `Hi! I'm ${newCharacter.name}! 😊`;
          setCurrentMessage(fallbackGreeting);
          speak(fallbackGreeting, { 
            voice: newCharacter.voice,
            gender: newCharacter.voiceGender,
            onStart: () => changeState('talking'),
            onEnd: () => changeState('idle')
          });
        }
      }, 500);
    }, 400);
  };

  const goToNext = () => {
    const currentIndex = getCurrentIndex();
    const newIndex = (currentIndex + 1) % characters.length;
    switchCharacter(newIndex);
  };

  const goToPrevious = () => {
    const currentIndex = getCurrentIndex();
    const newIndex = (currentIndex - 1 + characters.length) % characters.length;
    switchCharacter(newIndex);
  };

  // Initial greeting - only after user interaction
  useEffect(() => {
    if (!selectedCharacter || !hasInteracted) return;
    
    setTimeout(() => {
      const greeting = `Hi!`;
      setCurrentMessage(greeting);
      speak(greeting, { 
        voice: selectedCharacter.voice,
        gender: selectedCharacter.voiceGender,
        onStart: () => changeState('talking'),
        onEnd: () => changeState('idle')
      });
    }, 500);
  }, [hasInteracted]);

  // Enable interaction on any user click
  useEffect(() => {
    const handleClick = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };
    
    document.addEventListener('click', handleClick, { once: true });
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Handle voice input transcript
  useEffect(() => {
    if (transcript && !isListening) {
      handleUserMessage(transcript);
      resetTranscript();
    }
  }, [transcript, isListening]);

  const handleUserMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setCurrentMessage(`You: ${message}`);

    // Change to thinking state
    changeState('thinking');
    setIsThinking(true);

    try {
      // Get today's activities (from today)
      const today = new Date().toDateString();
      const todayActivities = activities.filter(a => 
        new Date(a.timestamp).toDateString() === today
      );

      // Get weekly routine for today
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayDay = daysOfWeek[new Date().getDay()];
      const weeklyRoutine = JSON.parse(localStorage.getItem('weeklyRoutine') || '{}');
      const todayRoutine = weeklyRoutine[todayDay] || [];
      
      // Debug: Check what's in localStorage
      console.log('🔍 DEBUG CompanionScreen - weeklyRoutine from localStorage:', weeklyRoutine);
      console.log('🔍 DEBUG CompanionScreen - todayDay:', todayDay);
      console.log('🔍 DEBUG CompanionScreen - todayRoutine:', todayRoutine);

      // Get pending tasks
      const pendingTasks = tasks.filter(t => !t.completed);

      // Get AI response with full context
      const response = await livingAI.generateResponse(message, {
        timeOfDay: getTimeOfDay(),
        activities: todayActivities,
        tasks: pendingTasks,
        routine: todayRoutine,
        todayDay: todayDay,
      });

      // Check if AI wants to add something
      const actionResult = await handleAIActions(response, message);

      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setCurrentMessage(actionResult || response);

      setIsThinking(false);
      
      speak(actionResult || response, { 
        voice: selectedCharacter.voice,
        gender: selectedCharacter.voiceGender,
        onStart: () => {
          // Change to talking state when audio actually starts
          changeState('talking');
        },
        onEnd: () => {
          // Return to idle after speaking completes
          changeState('idle');
        }
      });

    } catch (error) {
      console.error('AI Error:', error);
      changeState('idle');
      setIsThinking(false);
    }
  };

  // Handle AI actions (adding tasks, activities, etc.)
  const handleAIActions = async (aiResponse, userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Check if user is ASKING about reminders/tasks (not adding them)
    const isAskingAbout = (
      lowerMessage.match(/\b(what|tell me|show|list|view|see|display|check)\b.*\b(reminder|task|todo)/i) ||
      lowerMessage.match(/\b(reminder|task|todo).*\b(what|tell me|show|list|view|see|display|check)\b/i) ||
      lowerMessage.includes('tell me about') ||
      lowerMessage.includes('what are my') ||
      lowerMessage.includes('do i have any') ||
      lowerMessage.includes('show me')
    );

    // PRIORITY 1: Check if user wants to add a task/reminder (highest priority)
    // BUT exclude if they're just asking about reminders
    const wantsToAdd = (
      lowerMessage.includes('remind me') || 
      lowerMessage.includes('add task') || 
      lowerMessage.includes('add a task') ||
      lowerMessage.includes('add reminder') ||
      lowerMessage.includes('add a reminder') ||
      lowerMessage.includes('set a reminder') ||
      lowerMessage.includes('create task') ||
      lowerMessage.includes('new task') ||
      lowerMessage.includes('todo') || 
      lowerMessage.includes('need to') ||
      lowerMessage.match(/\b(remember|don't forget)\b.*\bto\b/i)
    );

    if (wantsToAdd && !isAskingAbout && onAddTask) {
      
      const taskData = extractTaskFromMessage(userMessage);
      if (taskData.text) {
        const newTask = {
          id: Date.now(),
          text: taskData.text,
          completed: false,
          createdAt: new Date().toISOString(),
          time: taskData.time || null,
          date: taskData.date || null,
          recurrence: taskData.recurrence || null,
        };
        
        onAddTask(newTask);
        
        // Build confirmation message
        let confirmMsg = `Got it! I've added "${taskData.text}" to your tasks. ✅`;
        if (taskData.time) confirmMsg += ` Time: ${taskData.time}`;
        if (taskData.date) confirmMsg += ` Date: ${taskData.date}`;
        if (taskData.recurrence) confirmMsg += ` (${taskData.recurrence})`;
        
        return confirmMsg;
      }
    }

    // PRIORITY 2: Check if user completed a task
    const hasCompletionWord = (
      lowerMessage.includes('done') || 
      lowerMessage.includes('completed') || 
      lowerMessage.includes('finished') || 
      lowerMessage.includes('called') ||
      lowerMessage.includes('bought') ||
      lowerMessage.includes('sent') ||
      lowerMessage.includes('emailed') ||
      lowerMessage.includes('made') ||
      lowerMessage.includes('wrote') ||
      lowerMessage.includes('read') ||
      lowerMessage.includes('mark') || 
      lowerMessage.includes('tick')
    );

    const pendingTasks = tasks.filter(t => !t.completed);
    
    // Try to complete task if there are pending tasks and message suggests completion
    if (hasCompletionWord && pendingTasks.length > 0 && onUpdateTask) {
      // Try to find and complete the task
      const completedTaskInfo = findAndCompleteTask(userMessage, tasks);
      if (completedTaskInfo) {
        return completedTaskInfo;
      }
    }

    // PRIORITY 3: Check if user wants to log an activity (lowest priority)
    if ((lowerMessage.includes('i just') || lowerMessage.includes('i did') || 
         lowerMessage.includes('i am') || lowerMessage.includes('i\'m') ||
         lowerMessage.includes('doing')) &&
        onAddActivity && onUpdateActivity) {
      
      const activityText = extractActivityFromMessage(userMessage);
      if (activityText) {
        const now = new Date().toISOString();
        const today = new Date().toDateString();
        
        // Find any ongoing activity from today
        const todayActivities = activities.filter(a => 
          new Date(a.timestamp).toDateString() === today
        );
        const ongoingActivity = todayActivities.find(a => !a.endTime);
        
        let response = '';
        
        // Check if user is saying they finished something (no new activity to start)
        const isFinishing = lowerMessage.match(/^(i\s+)?(just\s+)?(finished|done|completed)/i);
        
        if (isFinishing && ongoingActivity) {
          // They're just ending the current activity
          const startTimeToUse = ongoingActivity.startTime || ongoingActivity.timestamp;
          onUpdateActivity(ongoingActivity.id, {
            ...ongoingActivity,
            endTime: now,
            duration: calculateDuration(startTimeToUse, now)
          });
          return `Great! I've logged that you finished ${ongoingActivity.description}. You spent ${formatDuration(calculateDuration(startTimeToUse, now))} on it! 📝✨`;
        }
        
        // End the ongoing activity if it exists BEFORE starting new one
        if (ongoingActivity) {
          const startTimeToUse = ongoingActivity.startTime || ongoingActivity.timestamp;
          const duration = calculateDuration(startTimeToUse, now);
          
          // Update the existing activity to end it
          onUpdateActivity(ongoingActivity.id, {
            ...ongoingActivity,
            endTime: now,
            duration: duration
          });
          
          console.log('Ended ongoing activity:', ongoingActivity.description, 'Duration:', duration, 'minutes');
          
          response = `Ended "${ongoingActivity.description}" (${formatDuration(duration)}). Now logging: ${activityText}. Keep going! 💪`;
        } else {
          response = `Started logging: ${activityText}. I'll track the time for you! ⏱️`;
        }
        
        // Use setTimeout to ensure the state update completes before adding new activity
        setTimeout(() => {
          // Start a new activity
          const newActivity = {
            id: Date.now(),
            description: activityText,
            timestamp: now,
            startTime: now,
            endTime: null, // Will be set when next activity starts or user says they finished
            category: detectCategory(activityText),
            duration: null
          };
          
          onAddActivity(newActivity);
        }, 100); // Small delay to ensure state update
        
        return response;
      }
    }

    return null;
  };

  // Calculate duration in minutes
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.round((end - start) / (1000 * 60)); // Duration in minutes
  };

  // Format duration for display
  const formatDuration = (minutes) => {
    if (minutes < 1) return 'less than a minute';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  // Find and complete a task
  const findAndCompleteTask = (message, tasks) => {
    const lowerMessage = message.toLowerCase();
    const pendingTasks = tasks.filter(t => !t.completed);

    if (pendingTasks.length === 0) {
      return "You don't have any pending tasks! You're all caught up! 🎉";
    }

    // Check for "mark all done" or "complete all"
    if (lowerMessage.includes('all') && (lowerMessage.includes('done') || lowerMessage.includes('complete'))) {
      pendingTasks.forEach(task => {
        onUpdateTask(task.id, { ...task, completed: true });
      });
      return `Awesome! I've marked all ${pendingTasks.length} tasks as completed! 🎉✨`;
    }

    // Try to find specific task by matching keywords
    let bestMatch = null;
    let highestScore = 0;

    for (const task of pendingTasks) {
      const taskText = (task.text || task.title || '').toLowerCase();
      
      // Remove common trigger words from the message to get the core content
      const cleanedMessage = lowerMessage
        .replace(/^(i\s+)?(just\s+)?(have\s+)?(did|done|completed|finished|called|made|bought|sent|wrote|read)\s+/i, '')
        .replace(/\s+(task|it|that|this|now|already)\s*/g, ' ')
        .trim();
      
      // Split into words and filter out very short words
      const messageWords = cleanedMessage.split(/\s+/).filter(w => w.length > 2);
      const taskWords = taskText.split(/\s+/).filter(w => w.length > 2);
      
      // Calculate match score
      let score = 0;
      
      // Exact phrase match (highest priority)
      if (cleanedMessage.includes(taskText) || taskText.includes(cleanedMessage)) {
        score += 100;
      }
      
      // Check for word matches
      for (const taskWord of taskWords) {
        if (cleanedMessage.includes(taskWord)) {
          score += 10;
        }
      }
      
      // Bonus for matching important words (names, nouns)
      const importantWords = taskWords.filter(w => 
        w.length > 4 || // Longer words are usually more specific
        /^[A-Z]/.test(task.text || task.title) // Capitalized words (names)
      );
      
      for (const word of importantWords) {
        if (cleanedMessage.includes(word.toLowerCase())) {
          score += 20; // Extra points for important words
        }
      }
      
      // Check for partial matches in names (like "badshah" matching in "call badshah")
      const nameMatch = taskText.match(/call|email|message|text|meet|visit\s+(\w+)/);
      if (nameMatch && cleanedMessage.includes(nameMatch[1])) {
        score += 30;
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = task;
      }
    }

    // If we found a good match (score > 10), complete it
    if (bestMatch && highestScore >= 10) {
      onUpdateTask(bestMatch.id, { ...bestMatch, completed: true });
      return `Great job! I've marked "${bestMatch.text || bestMatch.title}" as completed! 🎉 Keep it up!`;
    }

    // If no specific task found, check if they just said "done"
    if (lowerMessage.match(/^(i\s+)?(done|completed|finished)(\s+it)?$/i) && pendingTasks.length > 0) {
      const task = pendingTasks[0]; // Most recent task
      onUpdateTask(task.id, { ...task, completed: true });
      return `Great job! I've marked "${task.text || task.title}" as completed! 🎉 Keep it up!`;
    }

    // If still no task found, list available tasks
    if (pendingTasks.length === 1) {
      const task = pendingTasks[0];
      return `Did you complete "${task.text || task.title}"? Say "yes" to mark it done! 📋`;
    } else if (pendingTasks.length <= 3) {
      const taskList = pendingTasks.map(t => `"${t.text || t.title}"`).join(', ');
      return `Which task did you complete? You have: ${taskList} 📋`;
    } else {
      return `You have ${pendingTasks.length} pending tasks. Which one did you complete? 📋`;
    }
  };

  // Extract task details from message
  const extractTaskFromMessage = (message) => {
    let taskText = '';
    let time = null;
    let date = null;
    let recurrence = null;

    // Remove trigger phrases to get the task
    let cleaned = message
      .replace(/^(please\s+)?remind me (to\s+)?/i, '')
      .replace(/^(please\s+)?add (a\s+)?(task|reminder|todo)\s+(to\s+)?/i, '')
      .replace(/^(i\s+)?(need|have) to\s+/i, '')
      .replace(/^todo:?\s*/i, '')
      .trim();

    // Extract time patterns (3pm, 15:00, 3:30pm, etc)
    const timePatterns = [
      /at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM))/i,
      /at\s+(\d{1,2}:\d{2})/,
      /(\d{1,2}\s*(?:am|pm|AM|PM))/i,
    ];

    for (const pattern of timePatterns) {
      const timeMatch = cleaned.match(pattern);
      if (timeMatch) {
        time = timeMatch[1].trim();
        cleaned = cleaned.replace(timeMatch[0], '').trim();
        break;
      }
    }

    // Extract date patterns
    const datePatterns = [
      /on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
      /on\s+(tomorrow|today)/i,
      /on\s+(\d{1,2}(?:st|nd|rd|th)?(?:\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*)?(?:\s+\d{4})?)/i,
      /(tomorrow|today)/i,
      /(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/,
    ];

    for (const pattern of datePatterns) {
      const dateMatch = cleaned.match(pattern);
      if (dateMatch) {
        date = dateMatch[1].trim();
        cleaned = cleaned.replace(dateMatch[0], '').trim();
        break;
      }
    }

    // Extract recurrence patterns
    const recurrencePatterns = [
      { pattern: /every\s+day|daily/i, value: 'daily' },
      { pattern: /every\s+week|weekly/i, value: 'weekly' },
      { pattern: /every\s+month|monthly/i, value: 'monthly' },
      { pattern: /every\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, value: 'weekly' },
      { pattern: /weekdays?/i, value: 'weekdays' },
      { pattern: /weekends?/i, value: 'weekends' },
    ];

    for (const { pattern, value } of recurrencePatterns) {
      const recMatch = cleaned.match(pattern);
      if (recMatch) {
        recurrence = value;
        if (recMatch[1] && pattern.toString().includes('monday|tuesday')) {
          // Specific day like "every Monday"
          recurrence = `weekly on ${recMatch[1].toLowerCase()}`;
        }
        cleaned = cleaned.replace(recMatch[0], '').trim();
        break;
      }
    }

    // Clean up remaining text
    taskText = cleaned
      .replace(/^(to\s+)?/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    return { text: taskText, time, date, recurrence };
  };

  // Extract activity from message
  const extractActivityFromMessage = (message) => {
    const patterns = [
      /i\s+just\s+(.+)/i,
      /i\s+did\s+(.+)/i,
      /i\s+am\s+(.+)/i,
      /i'm\s+(.+)/i,
      /doing\s+(.+)/i,
      /finished\s+(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  };

  // Simple category detection
  const detectCategory = (text) => {
    const lower = text.toLowerCase();
    if (lower.match(/work|meeting|email|call|project/)) return 'Work';
    if (lower.match(/study|learn|read|course|homework/)) return 'Study';
    if (lower.match(/gym|workout|exercise|run|jog|yoga/)) return 'Exercise';
    if (lower.match(/breakfast|lunch|dinner|eat|meal|food/)) return 'Meal';
    if (lower.match(/sleep|nap|rest|bed/)) return 'Sleep';
    return 'Leisure';
  };

  const handleVoiceToggle = () => {
    // Close chatbox when starting voice interaction
    setIsChatExpanded(false);
    
    if (isListening) {
      stopListening();
      changeState('idle');
    } else {
      startListening();
      changeState('listening');
      setCurrentMessage('I\'m listening...');
    }
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'late night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  // Safety check for selectedCharacter
  if (!selectedCharacter) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading companion...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Character Video - Fullscreen Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.7}
          onDragEnd={onDragEnd}
          style={{ x: dragX }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <AnimatedCharacter 
            character={selectedCharacter} 
            state={characterState}
            className="w-full h-full"
          />
        </motion.div>
      </div>

      {/* Open App Button - Top Right (Above all blur) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenApp}
        className="absolute top-4 right-4 z-50 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-md rounded-full text-white text-xs sm:text-sm font-semibold shadow-lg border border-white/20"
      >
        KwikLyze
      </motion.button>

      {/* Tap to Start Overlay */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-white/10 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/20"
            >
              <p className="text-white text-xl font-medium">👆 Tap anywhere to start</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Elements Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Character Switch Arrows - Minimal */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white text-lg opacity-30 hover:opacity-80 transition-all pointer-events-auto"
        >
          ‹
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white text-lg opacity-30 hover:opacity-80 transition-all pointer-events-auto"
        >
          ›
        </button>

        {/* Character Indicator Dots - Minimal */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-auto">
          {characters.map((char, index) => (
            <button
              key={char.id}
              onClick={() => switchCharacter(index)}
              className={`h-1.5 rounded-full transition-all ${
                char.id === selectedCharacter.id
                  ? 'bg-white w-8'
                  : 'bg-white/30 w-1.5 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Character Switching Animation Overlay */}
        <AnimatePresence>
          {showCharacterSwitch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vignette Effect - Blur Only (No Darkness) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Blur overlay for corners - no darkening */}
          <div 
            className="absolute inset-0 backdrop-blur-[3px]"
            style={{
              maskImage: 'radial-gradient(ellipse at center, transparent 35%, black 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 35%, black 100%)',
            }}
          />
        </div>

        {/* Current Message/Transcript - Speech Bubble Style */}
        <AnimatePresence mode="wait">
          {currentMessage && (
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="absolute bottom-40 inset-x-4 sm:bottom-48 sm:inset-x-8 z-20 flex justify-center"
            >
              <div className="relative max-w-2xl">
                {/* Speech bubble with tail pointing to character */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="relative"
                >
                  {/* Main speech bubble */}
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/30 shadow-2xl">
                    {/* Decorative corner accents */}
                    <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-purple-400/40 rounded-tl-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-pink-400/40 rounded-br-3xl"></div>
                    
                    {/* Animated words */}
                    <div className="text-white text-sm sm:text-base leading-relaxed flex flex-wrap gap-x-1.5 gap-y-1">
                      {currentMessage.split(' ').map((word, index) => (
                        <motion.span
                          key={`${word}-${index}`}
                          initial={{ 
                            opacity: 0, 
                            y: 20,
                            filter: 'blur(10px)'
                          }}
                          animate={{ 
                            opacity: 1, 
                            y: 0,
                            filter: 'blur(0px)'
                          }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.05,
                            ease: 'easeOut'
                          }}
                          className="font-medium"
                          style={{
                            display: 'inline-block',
                          }}
                        >
                          {word}
                        </motion.span>
                      ))}
                    </div>

                    {/* Character indicator */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xs font-semibold shadow-lg"
                    >
                      {selectedCharacter.name}
                    </motion.div>

                    {/* Speech bubble tail - pointing down to character */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                      <div className="w-6 h-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border-l border-b border-white/30 rotate-45"></div>
                    </div>
                  </div>

                  {/* Floating particles around bubble */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 bg-white/40 rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [-10, -30, -10],
                        opacity: [0.4, 0.8, 0.4],
                        scale: [1, 1.5, 1],
                      }}
                      transition={{
                        duration: 2 + i,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls - Blur Only Style */}
      <div className="absolute bottom-0 inset-x-0 z-20 pb-safe">
        {/* Backdrop blur for glass effect - no dark overlay */}
        <div className="absolute inset-0 backdrop-blur-xl" 
          style={{
            maskImage: 'radial-gradient(ellipse 120% 100% at bottom center, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 120% 100% at bottom center, black 0%, transparent 70%)',
          }}
        />
        
        <div className="relative max-w-2xl mx-auto space-y-3 p-4">

          {/* Beautiful Voice Input Button */}
          <div className="flex items-center justify-center mb-2">
            <div className="relative">
              {/* Pulsing rings when active */}
              {(isListening || isThinking) && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-current"
                    style={{ color: isListening ? '#ef4444' : '#a855f7' }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-current"
                    style={{ color: isListening ? '#ef4444' : '#a855f7' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                </>
              )}
              
              {/* Main button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleVoiceToggle}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center overflow-hidden shadow-2xl"
                style={{
                  background: isListening 
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : isThinking
                    ? 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)'
                    : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
                }}
              >
                {/* Glossy overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent rounded-full" />
                
                {/* Icon */}
                <motion.div
                  animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
                  className="relative z-10"
                >
                  {isListening ? (
                    <img src="/Image/Pause.png" alt="Pause" className="w-12 h-12 sm:w-14 sm:h-14" />
                  ) : isThinking ? (
                    <span className="text-4xl sm:text-5xl">💭</span>
                  ) : (
                    <img src="/Image/Chat.png" alt="Mic" className="w-12 h-12 sm:w-14 sm:h-14" />
                  )}
                </motion.div>

                {/* Inner glow */}
                <div className="absolute inset-2 rounded-full bg-white/10" />
              </motion.button>

              {/* Status text below */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <span className="text-white/60 text-xs font-medium">
                  {isListening ? '🔴 Listening...' : isThinking ? '💭 Thinking...' : 'Tap to speak'}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Chat Input - Collapsible */}
          <AnimatePresence mode="wait">
            {!isChatExpanded ? (
              // Collapsed state - Small chat button
              <motion.button
                key="collapsed"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsChatExpanded(true)}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden shadow-2xl"
              >
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse"></div>
                
                {/* Inner button */}
                <div className="absolute inset-0.5 bg-black/80 backdrop-blur-xl rounded-full flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="text-2xl"
                  >
                    💬
                  </motion.div>
                </div>

                {/* Notification dot */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full border-2 border-black"
                />
              </motion.button>
            ) : (
              // Expanded state - Full text input
              <motion.div
                key="expanded"
                initial={{ width: 56, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                exit={{ width: 56, opacity: 0 }}
                className="relative"
              >
                {/* Animated gradient border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-75 blur"></div>
                
                {/* Input container */}
                <div className="relative flex items-center gap-3 bg-black/50 backdrop-blur-2xl rounded-full px-5 py-3.5 border border-white/20">
                  {/* Sparkle icon */}
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="text-xl"
                  >
                    ✨
                  </motion.div>
                  
                  {/* Input field */}
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    autoFocus
                    className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-sm sm:text-base font-light"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        handleUserMessage(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  
                  {/* Status indicator or send button */}
                  {isListening ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex items-center gap-1.5"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-red-400 text-xs font-medium">Listening</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Send button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm shadow-lg"
                        onClick={(e) => {
                          const input = e.target.closest('.relative').querySelector('input');
                          if (input.value.trim()) {
                            handleUserMessage(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        →
                      </motion.button>

                      {/* Close button */}
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsChatExpanded(false)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg"
                      >
                        ✕
                      </motion.button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
