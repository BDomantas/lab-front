import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { useGameStore } from '@/store/game';
import { useGridDataStore } from '@/store/settings';

export const Stopwatch = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const { startGame } = useGameStore();
  const { settings } = useGridDataStore();

  // Move updateTimer outside of useEffect
  const updateTimer = () => {
    const now = Date.now();
    setTimeElapsed(now - (startTimeRef.current || now));
    timerRef.current = requestAnimationFrame(updateTimer); // Self-reference is okay here
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        cancelAnimationFrame(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    if (!timerRef.current) {
      startTimeRef.current = Date.now();
      timerRef.current = requestAnimationFrame(updateTimer);
    }

    startGame(settings.blockSetting.blockTime, settings.codeSetting.timeInterval);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimeElapsed(0);
  };

  // Format time to MM:SS
  const minutes = Math.floor(timeElapsed / 60000); // 60000 milliseconds = 1 minute
  const seconds = Math.floor((timeElapsed % 60000) / 1000);

  return (
    <div>
      <div>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <Button onClick={startTimer}>Start</Button>
      <Button onClick={stopTimer}>Stop</Button>
      <Button onClick={resetTimer}>Reset</Button>
    </div>
  );
};
