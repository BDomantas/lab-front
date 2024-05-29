import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface GameState {}

const useGameStore = create<GameState>()(
  devtools(persist(() => ({}), { name: 'gameStore', storage: createJSONStorage(() => localStorage) }))
);
