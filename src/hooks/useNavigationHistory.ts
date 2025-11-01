import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavigationHistory {
  fromPage: string;
  timestamp: number;
}

const STORAGE_KEY = 'navigationHistory';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const useNavigationHistory = () => {
  const navigate = useNavigate();
  const [backTo, setBackTo] = useState<string>('/equipment');

  // Save navigation history when entering a page
  const saveNavigationHistory = (fromPage: string) => {
    const history: NavigationHistory = {
      fromPage,
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  };

  // Get the back destination
  const getBackDestination = (): string => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return '/equipment';

      const history: NavigationHistory = JSON.parse(stored);
      
      // Check if history is still valid (not too old)
      if (Date.now() - history.timestamp > SESSION_TIMEOUT) {
        sessionStorage.removeItem(STORAGE_KEY);
        return '/equipment';
      }

      return history.fromPage || '/equipment';
    } catch (error) {
      console.error('Error reading navigation history:', error);
      return '/equipment';
    }
  };

  // Handle back navigation
  const handleBack = () => {
    const destination = getBackDestination();
    navigate(destination);
  };

  // Initialize back destination on mount
  useEffect(() => {
    setBackTo(getBackDestination());
  }, []);

  return {
    backTo,
    handleBack,
    saveNavigationHistory,
    getBackDestination
  };
};
