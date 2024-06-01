// gridDataStore.ts
import { create } from 'zustand';
import { RgbColor } from 'react-colorful';

type Setting = {
  color: RgbColor;
  gridData: number[][];
  gridCommandData: number[]; // New field for computed value
};

type GridDataStore = {
  settings: {
    default: Setting;
    [key: string]: Setting;
  };
} & Actions;

type Actions = {
  setGridData: (settingKey: string, rowIndex: number, columnIndex: number) => void;
  setColor: (settingKey: string, newColor: RgbColor) => void;
};

const gridToCommandData = (grid: number[][]) => grid.map((row) => parseInt(row.join(''), 2));

const defaultGrid = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
];
export const useGridDataStore = create<GridDataStore>((set) => ({
  settings: {
    default: {
      color: { r: 200, g: 150, b: 35 },
      gridData: defaultGrid,
      gridCommandData: gridToCommandData(defaultGrid), // New field for computed value
    },
  },
  setGridData: (settingKey, rowIndex, columnIndex) =>
    set((state) => {
      const setting = state.settings[settingKey] ?? state.settings.default;
      const newGridData = setting.gridData.map((row, i) =>
        i === rowIndex ? row.map((cell, j) => (j === columnIndex ? (cell === 0 ? 1 : 0) : cell)) : row
      );
      const newGridCommandData = gridToCommandData(newGridData);

      return {
        settings: {
          ...state.settings,
          [settingKey]: {
            ...setting,
            gridData: newGridData,
            gridCommandData: newGridCommandData,
          },
        },
      };
    }),
  setColor: (settingKey, newColor) =>
    set((state) => ({
      settings: {
        ...state.settings,
        [settingKey]: {
          ...(state.settings?.[settingKey] ?? state.settings.default),
          color: newColor,
        },
      },
    })),
}));
