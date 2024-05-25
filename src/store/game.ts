import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface GameState {}

const useGameStore = create<GameState>()((set) => ({}));
