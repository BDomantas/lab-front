import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface SystemState {
  isConnected: boolean;
  setIsConnected: (success: boolean) => void;
  statusGrid: boolean[];
}

export const useSystemStore = create<SystemState>()(
  devtools(
    persist(
      (set) => ({
        isConnected: false,
        setIsConnected: (success) => set(() => ({ isConnected: success })),
        setIsOnline: (index: string) =>
          set((state) => {
            const gridIndex = parseInt(index, 10);
            const newGrid = [...state.statusGrid];
            newGrid[gridIndex] = true;
            return {
              statusGrid: newGrid,
            };
          }),
        setOfflineOnline: (index: string) =>
          set((state) => {
            const gridIndex = parseInt(index, 10);

            const newGrid = [...state.statusGrid];
            newGrid[gridIndex] = false;
            return {
              statusGrid: newGrid,
            };
          }),
        statusGrid: Array(50).fill(false),
      }),
      {
        name: 'systemStore',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) =>
          Object.fromEntries(Object.entries(state).filter(([key]) => !['connected'].includes(key))),
      }
    )
  )
);
