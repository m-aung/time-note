import { useState, useEffect } from 'react';
import { differenceInSeconds, formatDistance } from 'date-fns';

export const useCountdown = (targetDate: string | Date) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date(targetDate);
      const diffInSeconds = differenceInSeconds(target, now);

      if (diffInSeconds <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        clearInterval(timer);
      } else {
        setTimeLeft(formatDistance(target, now, { addSuffix: true }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return { timeLeft, isExpired };
}; 