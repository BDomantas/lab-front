import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';

interface SystemState {
  isConnected: boolean;
  setIsConnected: (success: boolean) => void;
}

const useSystemStore = create<SystemState>()(
  devtools(
    persist(
      (set) => ({
        isConnected: false,
        setIsConnected: (success) => set(() => ({ isConnected: success })),
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
