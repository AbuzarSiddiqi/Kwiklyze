import { createContext, useContext, useState } from 'react';

const PersonalityContext = createContext();

export const usePersonality = () => {
  const context = useContext(PersonalityContext);
  if (!context) {
    throw new Error('usePersonality must be used within PersonalityProvider');
  }
  return context;
};

const PERSONALITIES = {
  motivational: {
    name: 'Motivational',
    emoji: '💪',
    description: 'Energetic and encouraging',
    voice: { rate: 1.1, pitch: 1.1 }
  },
  calm: {
    name: 'Calm',
    emoji: '🧘',
    description: 'Peaceful and zen-like',
    voice: { rate: 0.9, pitch: 0.9 }
  },
  funny: {
    name: 'Funny',
    emoji: '😄',
    description: 'Witty and humorous',
    voice: { rate: 1.2, pitch: 1.0 }
  },
  professional: {
    name: 'Professional',
    emoji: '💼',
    description: 'Formal and business-like',
    voice: { rate: 1.0, pitch: 1.0 }
  }
};

export const PersonalityProvider = ({ children }) => {
  const [currentPersonality, setCurrentPersonality] = useState('motivational');

  const personality = PERSONALITIES[currentPersonality];

  const changePersonality = (type) => {
    if (PERSONALITIES[type]) {
      setCurrentPersonality(type);
    }
  };

  const value = {
    personality,
    currentPersonality,
    personalities: PERSONALITIES,
    changePersonality
  };

  return <PersonalityContext.Provider value={value}>{children}</PersonalityContext.Provider>;
};
