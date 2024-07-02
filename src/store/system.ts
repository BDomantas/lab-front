import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface SystemState {
  isConnected: boolean;
  setIsConnected: (success: boolean) => void;
  statusGrid: boolean[];
}

type Actions = {
  updateStatus: (index: number, online: boolean) => void;
};

export const useSystemStore = create<SystemState & Actions>()(
  devtools(
    persist(
      immer((set) => ({
        isConnected: false,
        setIsConnected: (success) => set(() => ({ isConnected: success })),
        statusGrid: Array(50).fill(false),

        clearStatusGrid: () => set(() => ({ statusGrid: Array(50).fill(false) })),

        updateStatus: (index, online) =>
          set((state) => {
            console.log('updateStatus UPDATEE', index, online);
            const validIndex = index >= 1 && index <= 50;
            const validStatus = online === true || online === false;

            if (validIndex && validStatus) {
              state.statusGrid[index - 1] = online;
            } else {
              console.warn('Invalid index or status for updateStatus:', index, online);
            }
          }),
      })),
      {
        name: 'systemStore',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) =>
          Object.fromEntries(Object.entries(state).filter(([key]) => !['isConnected'].includes(key))),
      }
    )
  )
);
