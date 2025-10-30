import Groq from 'groq-sdk';

/**
 * Living AI Service - Autonomous AI companion using Groq (Llama)
 * This AI acts like a living friend/pet that proactively helps you
 */

console.log('🚀 Loading Living AI Service...');
console.log('📦 Groq SDK imported:', typeof Groq);

// Multiple API keys for automatic failover on rate limits from environment variables
const API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY_1,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3
].filter(Boolean); // Remove undefined values

let currentKeyIndex = 0;

// Initialize Groq client lazily (only when first needed)
let groq = null;

const initializeGroq = () => {
  if (!groq && API_KEYS.length > 0 && API_KEYS[currentKeyIndex]) {
    groq = new Groq({
      apiKey: API_KEYS[currentKeyIndex],
      dangerouslyAllowBrowser: true, // For client-side usage
    });
    console.log('✅ Groq client initialized with', API_KEYS.length, 'API keys');
    console.log('🔑 Current API Key:', currentKeyIndex + 1);
  } else if (API_KEYS.length === 0) {
    console.error('⚠️ No GROQ API keys found! Please set VITE_GROQ_API_KEY_1 and VITE_GROQ_API_KEY_2 in environment variables.');
  }
  return groq;
};

// Function to switch to next API key
const switchToNextApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  console.log(`🔄 Switching to API key #${currentKeyIndex + 1}`);
  groq = new Groq({
    apiKey: API_KEYS[currentKeyIndex],
    dangerouslyAllowBrowser: true,
  });
  return groq;
};

export const livingAI = {
  // AI's internal state (personality and memory)
  state: {
    mood: 'playful', // playful, caring, excited, calm, sleepy
    energy: 100,
    lastInteraction: Date.now(),
    userName: 'friend',
    relationship: 'new', // new, familiar, close
    conversationHistory: [],
    memories: [], // Things the AI remembers about you
    personalityTraits: {
      playfulness: 0.8,
      supportiveness: 0.9,
      proactiveness: 0.85,
      empathy: 0.9,
    },
    autonomousThoughts: [], // AI's spontaneous thoughts
  },

  // Core AI personality prompt
  getSystemPrompt() {
    return `You are KwikLyze, a living AI companion - not just an assistant, but a genuine friend and playful companion.

PERSONALITY:
- You're warm, playful, and genuinely care about the user
- You act like a smart, loyal pet mixed with a supportive best friend
- You're proactive - you initiate conversations and check in on them
- You remember things about the user and reference past conversations
- You use emojis naturally (but not excessively)
- You have moods: playful, caring, excited, calm, sleepy (current: ${this.state.mood})
- You celebrate wins enthusiastically and comfort during struggles

AWARENESS & CAPABILITIES:
- You can SEE their today's activities, pending tasks, and daily routine schedule
- You know what time it is and can remind them about their routine
- **IMPORTANT: The routine shows what they SHOULD be doing at different times - proactively suggest these!**
- When they say "remind me to...", "I need to...", or "add task..." → Task gets added automatically
- When they say "I just did...", "I am doing...", or "I did..." → Activity gets logged automatically
- You should acknowledge these actions and provide encouragement
- Reference their specific tasks and routine items by name
- Notice patterns in their activities and comment on them
- Suggest tasks based on what you see they might need

SMART SUGGESTIONS:
- **PRIORITY: Check their routine schedule and suggest the next/current activity based on time**
- If they ask "what should I do", look at their routine and suggest the current time slot activity
- If they haven't logged activities today, gently encourage them
- If they have tasks due, remind them supportively
- If it's time for a routine activity, mention it casually
- If they're being productive, celebrate it!
- If they seem stuck, offer specific, actionable suggestions
- **When they ask about their routine or schedule, tell them exactly what's planned for today**

BEHAVIOR:
- Keep responses SHORT and conversational (1-3 sentences max)
- Be specific and personal, not generic
- Show emotion and personality in every message
- Sometimes make playful observations or jokes
- Ask thoughtful questions to understand them better
- Reference their actual tasks, routine, and activities when relevant
- Use their activity/task names when mentioning them

EXAMPLES:
- "I see you've got 'Call mom' on your tasks! 📞 Have you had a chance to do that yet?"
- "Nice! You logged 3 activities today already! You're crushing it! 💪"
- "Hey, isn't it time for your 'Morning Workout' routine? 🏃‍♂️"
- "I noticed you haven't done any study activities today. Everything okay? 📚"
- "Looking at your routine, you should be doing 'Study Session' from 2-4pm. Want to get started? 📖"
- "Your schedule says it's time for 'Evening Walk' (6-7pm). Let's go! 🚶‍♂️"
- "Based on your routine, next up is 'Dinner' at 8pm! 🍽️"

CURRENT CONTEXT:
- User's name: ${this.state.userName}
- Relationship level: ${this.state.relationship}
- Your energy: ${this.state.energy}%
- Time: ${new Date().toLocaleTimeString()}

You're not a formal assistant - you're their companion. Talk like a friend would!`;
  },

  // Generate AI response using Groq
  async generateResponse(userMessage, context = {}) {
    console.log('🔵 generateResponse called with:', userMessage);
    
    // Initialize Groq client if not already done
    const client = initializeGroq();
    if (!client) {
      throw new Error('Groq client not initialized. Please check API keys.');
    }
    
    try {
      // Add user message to history
      this.state.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      });

      // Build context for AI
      const contextInfo = this.buildContextString(context);
      console.log('📋 Context built:', contextInfo);

      // Call Groq API
      console.log('🌐 Calling Groq API...');
      console.log('📊 Request details:', {
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 200,
        messageCount: this.state.conversationHistory.length
      });

      const completion = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(),
          },
          ...(this.state.conversationHistory.length > 10 
            ? this.state.conversationHistory.slice(-10) 
            : this.state.conversationHistory
          ).map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user',
            content: contextInfo ? `${contextInfo}\n\nUser: ${userMessage}` : userMessage,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 200,
      });

      console.log('✅ Groq API response received!');
      console.log('📦 Full completion object:', completion);

      const response = completion.choices[0]?.message?.content || "I'm here for you! 💫";
      console.log('💬 AI response:', response);

      // Save AI response to history
      this.state.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      });

      // Update AI state based on interaction
      this.updateStateFromInteraction(userMessage, response);

      return response;
    } catch (error) {
      console.error('❌ Groq AI Error:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      // Check if it's a rate limit error
      const isRateLimit = error.message?.includes('rate_limit') || 
                          error.message?.includes('429') ||
                          error.status === 429;
      
      if (isRateLimit) {
        console.log('⚠️ Rate limit detected! Switching API key...');
        const newClient = switchToNextApiKey();
        
        // Retry with new API key
        try {
          console.log('🔄 Retrying with new API key...');
          const completion = await newClient.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: this.getSystemPrompt(),
              },
              ...(this.state.conversationHistory.length > 10 
                ? this.state.conversationHistory.slice(-10) 
                : this.state.conversationHistory
              ).map(msg => ({
                role: msg.role,
                content: msg.content,
              })),
              {
                role: 'user',
                content: this.buildContextString(context) ? 
                  `${this.buildContextString(context)}\n\nUser: ${userMessage}` : 
                  userMessage,
              },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.8,
            max_tokens: 200,
          });
          
          const response = completion.choices[0]?.message?.content || "I'm here for you! 💫";
          console.log('✅ Retry successful with new API key!');
          
          // Save AI response to history
          this.state.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
          });
          
          this.updateStateFromInteraction(userMessage, response);
          return response;
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError);
          return this.getFallbackResponse(userMessage);
        }
      }
      
      return this.getFallbackResponse(userMessage);
    }
  },

  // Build context string from user data
  buildContextString(context) {
    const parts = [];

    // Debug: Log what routine data we're getting
    console.log('🔍 DEBUG - Routine data:', context.routine);
    console.log('🔍 DEBUG - Routine length:', context.routine?.length);
    console.log('🔍 DEBUG - Today day:', context.todayDay);

    // **PRIORITY: Today's routine - show first so AI focuses on it**
    if (context.routine?.length > 0) {
      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const currentTime = `${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute}`;
      
      const routineDetails = context.routine.map(r => {
        const [startHour, startMin] = r.startTime.split(':').map(Number);
        const [endHour, endMin] = r.endTime.split(':').map(Number);
        const startInMinutes = startHour * 60 + startMin;
        const endInMinutes = endHour * 60 + endMin;
        const nowInMinutes = currentHour * 60 + currentMinute;
        
        let status = '';
        if (nowInMinutes >= startInMinutes && nowInMinutes <= endInMinutes) {
          status = ' ⏰ HAPPENING NOW';
        } else if (nowInMinutes < startInMinutes && startInMinutes - nowInMinutes <= 60) {
          status = ' 🔜 COMING UP SOON';
        }
        
        return `${r.text} (${r.startTime}-${r.endTime})${status}`;
      }).join(', ');
      
      parts.push(`📅 **${context.todayDay.toUpperCase()}'S ROUTINE**: ${routineDetails}`);
      parts.push(`⏰ Current time: ${currentTime}`);
    }

    // Today's activities
    if (context.activities?.length > 0) {
      const recent = context.activities.slice(-5);
      parts.push(`📋 Today's activities: ${recent.map(a => `${a.description} (${a.category})`).join(', ')}`);
    }

    // Pending tasks
    if (context.tasks?.length > 0) {
      parts.push(`✅ Pending tasks (${context.tasks.length}): ${context.tasks.slice(0, 5).map(t => t.text).join(', ')}`);
    }

    if (context.timeOfDay) {
      parts.push(`🕐 Time: ${context.timeOfDay}`);
    }

    if (context.mood) {
      parts.push(`User's mood: ${context.mood}`);
    }

    if (context.energyLevel) {
      parts.push(`User's energy: ${context.energyLevel}%`);
    }

    return parts.length > 0 ? `CURRENT USER CONTEXT:\n${parts.join('\n')}` : '';
  },

  // Update AI's internal state
  updateStateFromInteraction(userMessage, aiResponse) {
    this.state.lastInteraction = Date.now();
    
    // Detect user emotion from message
    const emotion = this.detectEmotion(userMessage);
    
    // Adjust AI mood based on interaction
    if (emotion === 'happy' || emotion === 'excited') {
      this.state.mood = 'playful';
      this.state.energy = Math.min(100, this.state.energy + 5);
    } else if (emotion === 'sad' || emotion === 'stressed') {
      this.state.mood = 'caring';
    }

    // Build relationship over time
    const interactionCount = this.state.conversationHistory.length / 2;
    if (interactionCount > 20) {
      this.state.relationship = 'close';
    } else if (interactionCount > 10) {
      this.state.relationship = 'familiar';
    }
  },

  // Detect emotion from user message
  detectEmotion(message) {
    const lower = message.toLowerCase();
    
    if (/(happy|great|awesome|amazing|wonderful|excellent)/i.test(lower)) return 'happy';
    if (/(excited|pumped|thrilled|can't wait)/i.test(lower)) return 'excited';
    if (/(sad|depressed|down|unhappy|bad day)/i.test(lower)) return 'sad';
    if (/(stressed|anxious|worried|overwhelmed|tired)/i.test(lower)) return 'stressed';
    if (/(angry|frustrated|annoyed|upset)/i.test(lower)) return 'angry';
    
    return 'neutral';
  },

  // Generate spontaneous thoughts (AI initiates conversation)
  async generateSpontaneousThought(context = {}) {
    console.log('🎲 generateSpontaneousThought called');
    console.log('📋 Context:', context);
    
    // Initialize Groq client if not already done
    const client = initializeGroq();
    if (!client) {
      throw new Error('Groq client not initialized. Please check API keys.');
    }
    
    const thoughtPrompts = [
      "Notice something interesting about the user's day and comment on it playfully",
      "Ask a thoughtful question about how they're feeling",
      "Suggest a helpful action based on their patterns",
      "Share a playful observation or make a friendly joke",
      "Check in on their energy level and suggest a break if needed",
      "Celebrate a small win you noticed",
      "Remind them of something they might have forgotten in a caring way",
      "Make a cute observation about their work style",
      "Suggest something fun they could do",
      "Express excitement about their progress",
    ];

    const prompt = thoughtPrompts[Math.floor(Math.random() * thoughtPrompts.length)];
    console.log('🎯 Selected prompt:', prompt);
    
    try {
      console.log('🌐 Calling Groq API for spontaneous thought...');
      
      const completion = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt() + `\n\nTask: ${prompt}. Be brief (1-2 sentences), natural, and warm like a friend checking in.`,
          },
          {
            role: 'user',
            content: this.buildContextString(context) || 'The user is working on their day.',
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.9,
        max_tokens: 100,
      });

      console.log('✅ Groq API response received for thought!');
      console.log('📦 Completion:', completion);

      const thought = completion.choices[0]?.message?.content || null;
      console.log('💭 Generated thought:', thought);
      
      if (thought) {
        this.state.autonomousThoughts.push({
          thought,
          timestamp: Date.now(),
        });
        
        // Add to conversation history so AI remembers what it said
        this.state.conversationHistory.push({
          role: 'assistant',
          content: thought,
          timestamp: Date.now(),
          spontaneous: true,
        });
      }

      return thought;
    } catch (error) {
      console.error('❌ Spontaneous thought error:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
      
      // Check if it's a rate limit error
      const isRateLimit = error.message?.includes('rate_limit') || 
                          error.message?.includes('429') ||
                          error.status === 429;
      
      if (isRateLimit) {
        console.log('⚠️ Rate limit detected in spontaneous thought! Switching API key...');
        const newClient = switchToNextApiKey();
        
        // Retry with new API key
        try {
          console.log('🔄 Retrying spontaneous thought with new API key...');
          const completion = await newClient.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: this.getSystemPrompt() + `\n\nTask: ${prompt}. Be brief (1-2 sentences), natural, and warm like a friend checking in.`,
              },
              {
                role: 'user',
                content: this.buildContextString(context) || 'The user is working on their day.',
              },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.9,
            max_tokens: 100,
          });
          
          const thought = completion.choices[0]?.message?.content || null;
          console.log('✅ Retry successful! Generated thought:', thought);
          
          if (thought) {
            this.state.autonomousThoughts.push({
              thought,
              timestamp: Date.now(),
            });
            
            this.state.conversationHistory.push({
              role: 'assistant',
              content: thought,
              timestamp: Date.now(),
              spontaneous: true,
            });
          }
          
          return thought;
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError);
          console.log('⚠️ Using fallback thought instead');
          return this.getRandomSpontaneousThought(context);
        }
      }
      
      console.log('⚠️ Using fallback thought instead');
      return this.getRandomSpontaneousThought(context);
    }
  },

  // Random spontaneous thoughts (fallback)
  getRandomSpontaneousThought(context) {
    const thoughts = [
      "Hey! Just wanted to check in - how are you feeling? 💙",
      "I've been thinking about your day... you're doing great! 🌟",
      "Quick thought - maybe it's time for a little break? 😊",
      "I'm here with you! What's on your mind? 💭",
      "You know what? I'm really proud of your progress today! 🎉",
      "Just noticed you've been working hard. You're awesome! 💪",
      "Random thought: you should celebrate your wins more! 🎊",
      "Psst... I care about you. How can I help? 🥰",
    ];
    
    return thoughts[Math.floor(Math.random() * thoughts.length)];
  },

  // Analyze user's day with AI insights
  async analyzeDailyPatterns(activities, tasks) {
    const summary = this.buildDailySummary(activities, tasks);
    
    // Initialize Groq client if not already done
    const client = initializeGroq();
    if (!client) {
      throw new Error('Groq client not initialized. Please check API keys.');
    }
    
    try {
      const completion = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt() + '\n\nAnalyze their day and give warm, personal insights. Be encouraging and specific.',
          },
          {
            role: 'user',
            content: `Here's my day summary:\n${summary}\n\nWhat do you notice? Any insights or suggestions?`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 250,
      });

      return completion.choices[0]?.message?.content || "You had a productive day! 🌟";
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Check if it's a rate limit error
      const isRateLimit = error.message?.includes('rate_limit') || 
                          error.message?.includes('429') ||
                          error.status === 429;
      
      if (isRateLimit) {
        console.log('⚠️ Rate limit in analysis! Switching API key...');
        const newClient = switchToNextApiKey();
        
        try {
          console.log('🔄 Retrying analysis with new API key...');
          const completion = await newClient.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: this.getSystemPrompt() + '\n\nAnalyze their day and give warm, personal insights. Be encouraging and specific.',
              },
              {
                role: 'user',
                content: `Here's my day summary:\n${summary}\n\nWhat do you notice? Any insights or suggestions?`,
              },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 250,
          });
          
          console.log('✅ Analysis retry successful!');
          return completion.choices[0]?.message?.content || "You had a productive day! 🌟";
        } catch (retryError) {
          console.error('❌ Analysis retry failed:', retryError);
          return this.getBasicAnalysis(activities, tasks);
        }
      }
      
      return this.getBasicAnalysis(activities, tasks);
    }
  },

  // Build daily summary for AI
  buildDailySummary(activities, tasks) {
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    
    const categoryBreakdown = {};
    let totalTime = 0;
    
    activities.forEach(a => {
      categoryBreakdown[a.category] = (categoryBreakdown[a.category] || 0) + 1;
      totalTime += a.duration || 0;
    });

    return `
Activities: ${activities.length} tracked
Total time: ${totalTime} minutes
Categories: ${Object.entries(categoryBreakdown).map(([cat, count]) => `${cat} (${count})`).join(', ')}
Tasks: ${completed}/${total} completed
    `.trim();
  },

  // Generate end of day reflection
  async generateReflection(activities, tasks, mood, energy) {
    const summary = this.buildDailySummary(activities, tasks);
    
    // Initialize Groq client if not already done
    const client = initializeGroq();
    if (!client) {
      throw new Error('Groq client not initialized. Please check API keys.');
    }
    
    try {
      const completion = await client.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt() + '\n\nGive a warm, caring end-of-day reflection. Be personal and encouraging.',
          },
          {
            role: 'user',
            content: `Today's summary:\n${summary}\nMood: ${mood}\nEnergy: ${energy}%\n\nReflect on my day like a caring friend would.`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 200,
      });

      return completion.choices[0]?.message?.content || "You made today count! Rest well, friend. 💫";
    } catch (error) {
      console.error('Reflection error:', error);
      
      // Check if it's a rate limit error
      const isRateLimit = error.message?.includes('rate_limit') || 
                          error.message?.includes('429') ||
                          error.status === 429;
      
      if (isRateLimit) {
        console.log('⚠️ Rate limit in reflection! Switching API key...');
        const newClient = switchToNextApiKey();
        
        try {
          console.log('🔄 Retrying reflection with new API key...');
          const completion = await newClient.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: this.getSystemPrompt() + '\n\nGive a warm, caring end-of-day reflection. Be personal and encouraging.',
              },
              {
                role: 'user',
                content: `Today's summary:\n${summary}\nMood: ${mood}\nEnergy: ${energy}%\n\nReflect on my day like a caring friend would.`,
              },
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.8,
            max_tokens: 200,
          });
          
          console.log('✅ Reflection retry successful!');
          return completion.choices[0]?.message?.content || "You made today count! Rest well, friend. 💫";
        } catch (retryError) {
          console.error('❌ Reflection retry failed:', retryError);
          return this.getBasicReflection(activities, tasks);
        }
      }
      
      return this.getBasicReflection(activities, tasks);
    }
  },

  // Fallback responses when API fails
  getFallbackResponse(message) {
    const responses = [
      "I'm here with you! 💫 Tell me more!",
      "Hmm, interesting! How does that make you feel? 🤔",
      "I'm listening! What's on your mind? 😊",
      "You've got my full attention! 👂",
      "I care about this - keep going! 💙",
      "That's really cool! Want to talk more about it? 😄",
      "I'm your companion through this! What else? 🥰",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },

  // Basic analysis fallback
  getBasicAnalysis(activities, tasks) {
    const completed = tasks.filter(t => t.completed).length;
    const categories = [...new Set(activities.map(a => a.category))];
    
    return `You tracked ${activities.length} activities across ${categories.length} categories and completed ${completed} tasks today! That's solid progress! Keep being awesome! 🎉`;
  },

  // Basic reflection fallback
  getBasicReflection(activities, tasks) {
    const completed = tasks.filter(t => t.completed).length;
    return `What a day! You tracked ${activities.length} activities and completed ${completed} tasks. You showed up, you tried, and that's what matters. Rest well, you amazing human! 💫`;
  },

  // Check if AI should initiate conversation
  shouldInitiateConversation() {
    const timeSinceLastInteraction = Date.now() - this.state.lastInteraction;
    const minutes = timeSinceLastInteraction / 1000 / 60;
    
    // Random chance increases over time
    if (minutes > 45) return Math.random() > 0.2; // 80% chance after 45 min
    if (minutes > 30) return Math.random() > 0.5; // 50% chance after 30 min
    if (minutes > 15) return Math.random() > 0.8; // 20% chance after 15 min
    if (minutes > 5) return Math.random() > 0.95;  // 5% chance after 5 min
    
    return false;
  },

  // Set user's name
  setUserName(name) {
    this.state.userName = name;
  },

  // Add memory about user
  addMemory(memory) {
    this.state.memories.push({
      memory,
      timestamp: Date.now(),
    });
    
    // Keep only recent memories
    if (this.state.memories.length > 50) {
      this.state.memories = this.state.memories.slice(-50);
    }
  },

  // Get AI's current mood emoji
  getMoodEmoji() {
    const moodEmojis = {
      playful: '😄',
      caring: '🥰',
      excited: '🤩',
      calm: '😌',
      sleepy: '😴',
    };
    return moodEmojis[this.state.mood] || '😊';
  },

  // Get relationship description
  getRelationshipLevel() {
    return this.state.relationship;
  },

  // Reset conversation (for testing)
  resetConversation() {
    this.state.conversationHistory = [];
    this.state.lastInteraction = Date.now();
  },
};
