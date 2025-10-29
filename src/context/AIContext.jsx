import { createContext, useContext, useState, useCallback } from 'react';
import { buildDailyPrompt, buildSummaryPrompt, buildQuickAdvicePrompt } from '../utils/aiPromptBuilder';

const AIContext = createContext();

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState('groq'); // 'groq' or 'openai'

  /**
   * Send message to AI (simulated - ready for API integration)
   */
  const sendMessage = useCallback(async (userMessage, context = {}) => {
    setIsThinking(true);
    
    // Add user message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Build context-aware prompt
      const { activities = [], tasks = [], routine = [], personality = 'motivational' } = context;
      const systemPrompt = buildDailyPrompt(activities, tasks, routine, personality);
      
      // TODO: Replace with actual API call
      // For now, simulate AI response
      const aiResponse = await simulateAIResponse(userMessage, systemPrompt);
      
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
      return aiMsg;
    } catch (error) {
      console.error('AI error:', error);
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      return errorMsg;
    } finally {
      setIsThinking(false);
    }
  }, []);

  /**
   * Get end-of-day summary
   */
  const getDailySummary = useCallback(async (activities, tasks, routine) => {
    setIsThinking(true);
    
    try {
      const prompt = buildSummaryPrompt(activities, tasks, routine);
      // TODO: Replace with actual API call
      const summary = await simulateAIResponse('Generate my daily summary', prompt);
      
      setIsThinking(false);
      return summary;
    } catch (error) {
      console.error('Summary error:', error);
      setIsThinking(false);
      return 'Unable to generate summary at this time.';
    }
  }, []);

  /**
   * Get quick advice
   */
  const getQuickAdvice = useCallback(async (currentActivity, recentActivities) => {
    const prompt = buildQuickAdvicePrompt(currentActivity, recentActivities);
    // TODO: Replace with actual API call
    return simulateAIResponse('Give me advice', prompt);
  }, []);

  /**
   * Clear conversation
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const value = {
    messages,
    isThinking,
    apiKey,
    apiProvider,
    setApiKey,
    setApiProvider,
    sendMessage,
    getDailySummary,
    getQuickAdvice,
    clearMessages
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

/**
 * Simulated AI response (replace with actual API)
 */
const simulateAIResponse = async (userMessage, systemPrompt) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const lowerMsg = userMessage.toLowerCase();
  
  // Simple pattern matching for demo
  if (lowerMsg.includes('summary')) {
    return "Great job today! 🎉 You've been productive and stayed on track. Keep up the momentum tomorrow!";
  }
  
  if (lowerMsg.includes('task') || lowerMsg.includes('remind')) {
    return "I've noted that! I'll remind you when it's time. Stay focused on what you're doing now! 💪";
  }
  
  if (lowerMsg.includes('advice') || lowerMsg.includes('help')) {
    return "Remember to take regular breaks every hour. Stay hydrated and keep your energy up! 🚀";
  }
  
  if (lowerMsg.includes('start') || lowerMsg.includes('begin')) {
    return "Awesome! Starting strong is half the battle. You've got this! 🌟";
  }
  
  return "I'm here to help! Let me know if you need advice, want to log an activity, or set a reminder. 😊";
};
