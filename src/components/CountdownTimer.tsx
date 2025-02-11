import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface CountdownTimerProps {
  expireAt: string;
  style?: TextStyle;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  expireAt, 
  style 
}) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiration = new Date(expireAt).getTime();
      const difference = expiration - now;

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

  return (
    <Text style={[styles.timer, style]}>
      {timeLeft}
    </Text>
  );
};

const styles = StyleSheet.create({
  timer: {
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
}); 