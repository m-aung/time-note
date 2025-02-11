import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';

interface CountdownTimerProps {
  expireAt: string;
}

export const CountdownTimer = ({ expireAt }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expireTime = new Date(expireAt).getTime();
      const difference = expireTime - now;

      if (difference <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expireAt]);

  return <Text style={styles.timer}>{timeLeft}</Text>;
};

const styles = StyleSheet.create({
  timer: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
    fontVariant: ['tabular-nums'],
  },
}); 