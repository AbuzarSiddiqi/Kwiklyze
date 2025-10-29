# 🧠 KwikLyze - AI Daily Companion

A friendly, time-aware AI companion PWA that **feels alive** - built with React + Vite. KwikLyze doesn't just track your day, it connects with you emotionally through breathing animations, voice-reactive UI, memory visualizations, and playful AI interactions.

![Made with React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss)

## ✨ Features

### 🎯 Core Features

- **📝 Daily Activity Log** - Track activities with voice or text input, automatic timestamping, and duration tracking
- **📋 Ideal Routine Planner** - Set your perfect daily schedule and compare with actual activities
- **✅ Smart Task Manager** - One-time and recurring tasks with voice reminders and notifications
- **🤖 Time-Aware AI Assistant** - Floating AI bubble that greets you based on time of day and provides contextual advice
- **📊 Analytics Dashboard** - Interactive Recharts visualizations (Pie, Bar, Line charts)

### 🌟 Immersive Features (Next-Level UI/UX)

- **🌊 Living Background** - Interface breathes with you, reacts to your voice with floating particles
- **❤️ Emotion Tracking** - Monitors mood, energy levels, and voice amplitude throughout the day
- **🎭 AI Micro Moments** - Playful, human-like AI reactions (hums, sighs, celebrations, encouragement)
- **🌍 Environment Simulator** - Dynamic particles, sun rays, moon, stars that change with time of day
- **💫 Memory Aura Space** - 3D-style bubble visualization of your daily activities
- **🪞 Mirror Mode** - End-of-day reflection with animated aura visualization and AI-spoken insights
- **📖 AI Journal Moments** - Thoughtful prompts throughout the day for reflection and gratitude
- **🌙 Dream Mode** - Night environment when you sleep, dream-based morning greetings
- **📈 Emotion Graph Fusion** - Comprehensive emotional timeline combining mood, energy, voice, and activity
- **⚙️ Settings Panel** - Full control over all immersive features, moods, energy, and AI personality

### 🎨 Enhanced Features

- **🎤 Voice Interaction** - Full Web Speech API integration (STT/TTS)
- **🔔 Smart Notifications** - Browser notifications with TTS announcements
- **🎨 Dynamic Theming** - Background gradients change throughout the day (Morning, Noon, Evening, Night)
- **🎉 Animations** - Framer Motion transitions, breathing effects, particle systems
- **💾 Offline Storage** - IndexedDB persistence using localforage
- **📱 PWA Support** - Installable, works offline with service worker
- **🔄 Data Export/Import** - JSON and CSV export capabilities
- **😊 AI Personality Modes** - Friend, Coach, Zen Master, Professional

## 🚀 Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool
- **TailwindCSS 3** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **localforage** - Offline storage
- **vite-plugin-pwa** - PWA capabilities
- **Web Speech API** - Voice features
- **Notification API** - Browser notifications

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎮 Usage

1. **Open the app** - Visit `http://localhost:5173`
2. **Grant permissions** - Allow microphone and notifications for full experience
3. **Start logging** - Click on activities or use voice input
4. **Set your routine** - Go to "Routine" tab and plan your ideal day
5. **Add tasks** - Create one-time or recurring tasks with reminders
6. **Chat with AI** - Click the floating AI bubble to get personalized advice
7. **View analytics** - Check the "Analytics" tab for insights
8. **End of day** - Click "View Daily Summary" for AI-generated recap

## 🗂️ Project Structure

```
src/
├── components/
│   ├── ActivityLog.jsx          # Activity tracking with timeline
│   ├── AIAssistant.jsx           # Floating AI chat interface
│   ├── Dashboard.jsx             # Main dashboard with stats
│   ├── EndOfDaySummary.jsx       # Daily summary modal
│   ├── RoutinePlanner.jsx        # Ideal routine scheduler
│   ├── TaskManager.jsx           # Task list with reminders
│   └── Charts/
│       ├── CategoryPieChart.jsx  # Time distribution pie chart
│       ├── DailyChart.jsx        # Daily activity bar chart
│       └── WeeklyTrends.jsx      # 7-day trend line chart
├── context/
│   ├── AIContext.jsx             # AI state management
│   ├── PersonalityContext.jsx    # AI personality modes
│   └── ThemeContext.jsx          # Time-based theming
├── hooks/
│   ├── useNotifications.js       # Browser notifications hook
│   ├── useSpeech.js              # Web Speech API hook
│   └── useStorage.js             # IndexedDB persistence hook
├── utils/
│   ├── aiPromptBuilder.js        # AI prompt generation
│   ├── dataExport.js             # Export/import utilities
│   └── timeUtils.js              # Time formatting utilities
├── App.jsx                       # Main app component
└── main.jsx                      # Entry point with PWA registration
```

## 🤖 AI Integration (Ready for API)

The app is designed with modular AI logic, ready to integrate with:

- **Groq AI** (Fast Llama models)
- **OpenAI** (GPT-4, GPT-3.5)

Current implementation uses intelligent pattern matching. To connect real AI:

1. Add your API key in the app settings
2. Update `AIContext.jsx` `simulateAIResponse` function
3. Uncomment API call logic

## 📱 PWA Features

- ✅ Installable on desktop and mobile
- ✅ Offline functionality
- ✅ Background sync (ready)
- ✅ Push notifications (ready)
- ✅ App manifest configured
- ✅ Service worker with Workbox

## 🎯 Categories

- 💼 Work
- 📚 Study
- 🏃 Exercise
- 🍽️ Meal
- 🎮 Leisure
- 😴 Sleep

## 🔊 Voice Commands

The app understands natural language for:

- "I started studying"
- "Remind me to drink water in 30 minutes"
- "Give me advice"
- "Generate my daily summary"

## 📊 Analytics

- Time spent per category (Pie chart)
- Daily activity breakdown (Bar chart)
- Weekly trends (Line chart)
- Routine adherence percentage
- Task completion rate

## 🛠️ Development

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Serve production build
npm run preview
```

## 🚀 Deployment

The app can be deployed to:

- **Vercel** - `vercel deploy`
- **Netlify** - Drag & drop `dist/` folder
- **GitHub Pages** - Build and push `dist/`

---

**Note**: For full voice features, use a browser that supports Web Speech API (Chrome, Edge recommended). HTTPS required for microphone access in production.

**Enjoy tracking and improving your day with KwikLyze! 🚀**
