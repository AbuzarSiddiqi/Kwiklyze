import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for browser notifications
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [isSupported, setIsSupported] = useState('Notification' in window);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  /**
   * Show a notification
   */
  const showNotification = useCallback(async (title, options = {}) => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return null;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        console.warn('Notification permission denied');
        return null;
      }
    }

    const notification = new Notification(title, {
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      ...options
    });

    return notification;
  }, [isSupported, permission, requestPermission]);

  /**
   * Schedule a notification
   */
  const scheduleNotification = useCallback((title, options, delayMs) => {
    return setTimeout(() => {
      showNotification(title, options);
    }, delayMs);
  }, [showNotification]);

  /**
   * Show notification with TTS
   */
  const showNotificationWithSpeech = useCallback(async (title, body, speak) => {
    const notification = await showNotification(title, { body });
    
    if (notification && speak && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(body || title);
      window.speechSynthesis.speak(utterance);
    }

    return notification;
  }, [showNotification]);

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    scheduleNotification,
    showNotificationWithSpeech
  };
};
