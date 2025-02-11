import { useState, useCallback } from 'react';
import { handleAuthError } from '../utils/errorHandling';

export const useErrorHandler = () => {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((error: unknown) => {
    console.error('Error caught:', error);
    const message = handleAuthError(error);
    setError(message);
    return message;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}; 