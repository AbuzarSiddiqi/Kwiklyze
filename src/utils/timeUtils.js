/**
 * Get current time period of day
 */
export const getTimeOfDay = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'noon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = () => {
  const timeOfDay = getTimeOfDay();
  const greetings = {
    morning: 'Good Morning 🌞',
    noon: 'Good Afternoon ☀️',
    evening: 'Good Evening 🌆',
    night: 'Good Night 🌙'
  };
  return greetings[timeOfDay];
};

/**
 * Get gradient class based on time of day
 */
export const getTimeGradient = () => {
  const timeOfDay = getTimeOfDay();
  const gradients = {
    morning: 'gradient-morning',
    noon: 'gradient-noon',
    evening: 'gradient-evening',
    night: 'gradient-night'
  };
  return gradients[timeOfDay];
};

/**
 * Format time to HH:MM AM/PM
 */
export const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date to readable string
 */
export const formatDate = (date = new Date()) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Calculate duration between two times in minutes
 */
export const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / 1000 / 60);
};

/**
 * Format duration in minutes to human readable
 */
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

/**
 * Check if it's midnight (for auto reset)
 */
export const isMidnight = () => {
  const now = new Date();
  return now.getHours() === 0 && now.getMinutes() === 0;
};

/**
 * Get start and end of today
 */
export const getTodayBounds = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return { start, end };
};

/**
 * Check if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};
