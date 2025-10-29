import { createContext, useContext, useState, useEffect } from 'react';
import { getTimeOfDay, getTimeGradient } from '../utils/timeUtils';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [gradient, setGradient] = useState(getTimeGradient());
  const [isDark, setIsDark] = useState(false);

  // Update theme based on time
  useEffect(() => {
    const updateTheme = () => {
      const newTimeOfDay = getTimeOfDay();
      const newGradient = getTimeGradient();
      
      setTimeOfDay(newTimeOfDay);
      setGradient(newGradient);
      setIsDark(newTimeOfDay === 'night');
    };

    updateTheme();
    
    // Check every minute for time changes
    const interval = setInterval(updateTheme, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const value = {
    timeOfDay,
    gradient,
    isDark
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
