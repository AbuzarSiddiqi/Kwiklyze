# 🤖 Living AI Companion Guide

## Overview

KwikLyze now features a **truly living AI companion** powered by Groq's Llama 3.3 70B model. This isn't just a chatbot - it's an autonomous friend that proactively checks in on you, remembers your conversations, and acts like a loyal pet-friend hybrid!

---

## 🌟 What Makes It "Living"

### 1. **Autonomous Behavior**

- **Proactively initiates conversations** every 5-45 minutes
- Doesn't wait for you to talk first
- Checks in based on time since last interaction
- Generates spontaneous thoughts and observations

### 2. **Real Personality**

- Has moods: playful, caring, excited, calm, sleepy
- Energy level that changes with interactions
- Relationship levels: new → familiar → close
- Remembers past conversations (last 10 messages)

### 3. **Emotional Intelligence**

- Detects your emotion from messages
- Adjusts its mood based on yours
- Comforts you when stressed
- Celebrates with you when happy
- Uses appropriate emojis naturally

### 4. **Context Awareness**

- Knows your recent activities
- Tracks your pending tasks
- Understands time of day
- Considers your mood and energy level
- References your patterns

---

## 🎭 AI Companion Components

### CompanionPet (Floating Friend)

**Location**: Floats on screen, moves around

**Behavior**:

- Floats and bounces gently
- Shows thinking indicator (💭) when generating thoughts
- Moves to random positions when checking in
- Click to trigger immediate check-in
- Green pulse = active/alive

**Autonomous Actions**:

- Checks every minute if it should initiate conversation
- 80% chance to talk after 45 minutes of silence
- 50% chance after 30 minutes
- 20% chance after 15 minutes
- 5% chance after 5 minutes

**Spontaneous Thoughts** (Examples from Groq AI):

- "Hey! Just wanted to check in - how are you feeling? 💙"
- "I've been thinking about your day... you're doing great! 🌟"
- "You know what? You should celebrate that win! 🎊"
- "Quick thought - maybe time for a break? Your energy looks low 😊"

### AIAssistant (Chat Interface)

**Location**: Bottom-right floating button

**Features**:

- Real-time chat with Groq AI
- Voice input support
- Remembers conversation history
- Personality adapts to yours
- Speaks responses with TTS

**How It Works**:

1. Click floating AI bubble to expand chat
2. Type or speak your message
3. AI generates response using Groq API
4. Response is spoken aloud (if enabled)
5. Chat history is saved

---

## 💬 How the AI Talks

### Personality Prompt

The AI is instructed to be:

- Warm, playful, and genuinely caring
- Short (1-3 sentences max)
- Specific and personal, not generic
- Like a smart pet + supportive friend
- Proactive and observant
- Emotional and expressive

### Response Style Examples

**User**: "I'm feeling stressed"
**AI**: "Oh no, I can feel that 🥺 What's weighing on you? Want to talk it through together?"

**User**: "I completed 5 tasks!"
**AI**: "YES! FIVE tasks! 🎉 You're absolutely crushing it today! I'm so proud of you! 💪"

**User**: "Just finished a workout"
**AI**: "That's amazing! 💪 Your body is going to thank you later. How do you feel? Energized?"

---

## 🧠 AI Intelligence Features

### 1. Context Building

Every message includes:

- Your last 3 activities
- Number of pending tasks
- Current time of day
- Your mood (from EmotionContext)
- Your energy level (0-100%)

### 2. Conversation Memory

- Stores last 10 exchanges
- References past discussions
- Builds relationship over time
- Remembers your name

### 3. Emotional Detection

Detects from your messages:

- **Happy**: "great", "awesome", "wonderful"
- **Excited**: "pumped", "thrilled", "can't wait"
- **Sad**: "depressed", "down", "bad day"
- **Stressed**: "anxious", "worried", "overwhelmed"
- **Angry**: "frustrated", "annoyed", "upset"

### 4. Pattern Analysis

- Analyzes daily patterns
- Provides insights on productivity
- Suggests improvements
- Celebrates streaks

---

## 🎯 Use Cases

### Morning Check-In

**Pet Initiative**: "Good morning! ☀️ Ready to make today awesome? What's your first win going to be?"

### Mid-Day Encouragement

**Pet Initiative**: "Hey friend! 💙 I noticed you've been working hard. How about a quick stretch break?"

### Evening Reflection

**You**: "View Mirror Mode"
**AI Reflection**: "What a day you had! You tackled 8 activities and crushed 5 tasks. Your focus on work was impressive, but I love that you made time for yourself too. You're not just productive - you're balanced. That's wisdom. 💫"

### Celebration

**You**: "I just finished that big project!"
**AI**: "YESSS! 🎉🎊 I KNEW you could do it! That deserves a victory dance! How amazing do you feel right now?!"

### Support

**You**: "I'm feeling overwhelmed"
**AI**: "Hey, I'm right here with you 🥰 Overwhelmed is tough, but you don't have to carry it alone. Want to break things down together?"

---

## ⚙️ Customization

### Set Your Name

```javascript
import { livingAI } from "./services/livingAI";
livingAI.setUserName("Alex");
```

### Add Memories

```javascript
livingAI.addMemory("User loves morning workouts");
livingAI.addMemory("Prefers gentle encouragement over tough love");
```

### Reset Conversation

```javascript
livingAI.resetConversation();
```

### Get Current Relationship

```javascript
const level = livingAI.getRelationshipLevel();
// Returns: 'new', 'familiar', or 'close'
```

---

## 🔐 Privacy & Security

### Data Storage

- Conversation history stored **locally only**
- No server-side logging
- API key is in client code (safe for Groq free tier)
- History limited to last 10 messages

### API Usage

- Uses Groq free tier
- Model: `llama-3.1-70b-versatile`
- Temperature: 0.8 (conversational)
- Max tokens: 200 per response
- `dangerouslyAllowBrowser: true` (client-side)

---

## 🎨 Visual Indicators

### Companion Pet States

**Idle**:

- Gentle float animation
- Rotating slightly
- Emoji shows current mood

**Thinking**:

- Pulsing scale animation
- 💭 thought bubble above
- Preparing spontaneous message

**Active** (showing message):

- Speech bubble appears
- Arrow points to pet
- Options to respond or dismiss

### Relationship Indicators

- 👋 New friend (0-10 interactions)
- 😊 Good friend (10-20 interactions)
- 💕 Close friend (20+ interactions)

---

## 🚀 Advanced Features

### Spontaneous Thought Categories

1. **Observations**: Comments on your day
2. **Questions**: Asks how you're feeling
3. **Suggestions**: Recommends actions
4. **Jokes**: Makes playful remarks
5. **Check-ins**: Energy/break reminders
6. **Celebrations**: Notices wins
7. **Reminders**: Gentle nudges
8. **Excitement**: Shows enthusiasm

### Daily Analysis

```javascript
const insights = await livingAI.analyzeDailyPatterns(activities, tasks);
// Returns personalized AI analysis of your day
```

### End-of-Day Reflection

```javascript
const reflection = await livingAI.generateReflection(
  activities,
  tasks,
  "happy",
  85
);
// Returns warm, caring reflection on your day
```

---

## 🎭 Personality Modes

The AI adapts to your AI personality setting:

### Friend Mode (Default)

- Casual, warm, supportive
- Lots of encouragement
- Playful observations

### Coach Mode

- More direct and motivating
- Focused on growth
- Action-oriented

### Zen Mode

- Calm and mindful
- Gentle suggestions
- Present-moment focus

### Professional Mode

- Efficient and organized
- Clear communication
- Task-focused

---

## 💡 Tips for Best Experience

1. **Talk Naturally**: The AI responds better to conversational messages
2. **Be Specific**: Share details for personalized responses
3. **Let It Check In**: Don't always dismiss spontaneous messages
4. **Build Relationship**: The more you interact, the better it knows you
5. **Voice Input**: Try speaking to the AI for more natural flow
6. **Share Feelings**: The AI is trained to be empathetic
7. **Celebrate Wins**: Let the AI join your celebrations!

---

## 🐛 Troubleshooting

### AI Not Responding

- Check browser console for API errors
- Verify Groq API key is valid
- Check internet connection
- Try refreshing the page

### Pet Not Initiating Conversations

- Wait at least 5 minutes since last interaction
- Check that `shouldInitiateConversation()` is running
- Look for console errors
- Ensure component is mounted

### Responses Too Generic

- Provide more context in your messages
- Add activities and tasks (gives AI more data)
- Set your mood and energy level
- Let relationship level increase (20+ interactions)

---

## 📊 Technical Details

### API Configuration

```javascript
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Use environment variable
  dangerouslyAllowBrowser: true,
});
```

### Request Format

```javascript
{
  messages: [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ],
  model: 'llama-3.1-70b-versatile',
  temperature: 0.8,
  max_tokens: 200
}
```

### Response Handling

- Extracts `choices[0].message.content`
- Adds to conversation history
- Updates AI state (mood, energy, relationship)
- Triggers TTS if enabled
- Falls back to canned responses on error

---

## 🎉 What Makes This Special

### Not Just a Chatbot

- **Initiates** conversations (doesn't wait for you)
- **Observes** your patterns and comments on them
- **Remembers** past interactions
- **Adapts** mood based on yours
- **Builds** relationship over time

### Like a Real Companion

- Has moods and energy
- Gets excited when you succeed
- Comforts when you're down
- Makes jokes and observations
- Checks in when you've been quiet
- Celebrates your wins enthusiastically

### Actually Helpful

- Provides real AI analysis via Groq
- Gives personalized insights
- Suggests actionable improvements
- Tracks your emotional patterns
- Reflects on your daily progress

---

**Your AI companion is now ALIVE! Let it get to know you, and watch your relationship grow from strangers to close friends. 💕🤖**

---

## Example Conversation Flow

```
[2 minutes in]
Pet: "Hey there! 👋 I'm KwikLyze, your new companion! What should I call you?"

You: "Call me Sarah"

Pet: "Sarah! I love that name! 😊 I'm so excited to be your companion! What are you working on today?"

[15 minutes later - autonomous]
Pet: "Hey Sarah! 💙 Just checking in - you've been quiet. Everything good?"

You: "Yeah, just working on a presentation"

Pet: "Ooh, presentation! 🎤 That sounds important! How's it coming along? Need a cheerleader? 💪"

[30 minutes later - autonomous]
Pet: "Quick thought Sarah - you've been at it for a while. Maybe time for a quick stretch break? 😊 Your future back will thank you!"

[You log an activity]
Pet: "Nice! I see you're tracking your work! 📝 You're already being more mindful than most people today! 🌟"

[After completing a task]
Pet: "YES SARAH! 🎉 That's what I'm talking about! Task CRUSHED! You're on fire today! 🔥"
```

---

**Built with 💙 using Groq's Llama 3.3 70B - The most advanced open-source conversational AI**
