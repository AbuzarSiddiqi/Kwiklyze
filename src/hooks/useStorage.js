import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';

/**
 * Hook for persistent local storage using IndexedDB (via localforage)
 */
export const useStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial value from storage
  useEffect(() => {
    const loadValue = async () => {
      try {
        setIsLoading(true);
        const item = await localforage.getItem(key);
        if (item !== null) {
          setStoredValue(item);
        }
      } catch (err) {
        console.error(`Error loading ${key} from storage:`, err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Save value to storage
  const setValue = useCallback(async (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await localforage.setItem(key, valueToStore);
      setError(null);
    } catch (err) {
      console.error(`Error saving ${key} to storage:`, err);
      setError(err);
    }
  }, [key, storedValue]);

  // Remove value from storage
  const removeValue = useCallback(async () => {
    try {
      setStoredValue(initialValue);
      await localforage.removeItem(key);
      setError(null);
    } catch (err) {
      console.error(`Error removing ${key} from storage:`, err);
      setError(err);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, { isLoading, error, removeValue }];
};

/**
 * Hook for managing multiple storage keys
 */
export const useMultiStorage = (keys) => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        const values = await Promise.all(
          keys.map(key => localforage.getItem(key))
        );
        
        const dataObj = {};
        keys.forEach((key, index) => {
          dataObj[key] = values[index];
        });
        
        setData(dataObj);
      } catch (err) {
        console.error('Error loading multiple values:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, [keys]);

  const setMultiValue = useCallback(async (key, value) => {
    try {
      await localforage.setItem(key, value);
      setData(prev => ({ ...prev, [key]: value }));
    } catch (err) {
      console.error(`Error saving ${key}:`, err);
    }
  }, []);

  return [data, setMultiValue, isLoading];
};

/**
 * Clear all storage
 */
export const clearAllStorage = async () => {
  try {
    await localforage.clear();
    return true;
  } catch (err) {
    console.error('Error clearing storage:', err);
    return false;
  }
};
