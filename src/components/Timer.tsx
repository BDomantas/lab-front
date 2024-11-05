import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { useGameStore } from '@/store/game';
import { useGridDataStore } from '@/store/settings';

export const Stopwatch = () => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const { startGame, pauseGame, resetGame, updateBoxBlockTimers } = useGameStore();
  const { settings } = useGridDataStore();

  // Move updateTimer outside of useEffect
  const updateTimer = () => {
    const now = Date.now();
    setTimeElapsed(now - (startTimeRef.current || now));
    updateBoxBlockTimers();
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
      pauseGame();
    }
  };

  const resetTimer = () => {
    stopTimer();
    setTimeElapsed(0);
    resetGame();
  };

  // Format time to MM:SS
  const minutes = Math.floor(timeElapsed / 60000); // 60000 milliseconds = 1 minute
  const seconds = Math.floor((timeElapsed % 60000) / 1000);

  return (
    <div className="gap-4">
      <div className="text-center text-5xl font-bold py-10">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex gap-4">
        <Button onClick={startTimer}>Start</Button>
        <Button onClick={stopTimer}>Stop</Button>
        <Button variant={'destructive'} onClick={resetTimer}>
          Reset
        </Button>
      </div>
    </div>
  );
};
