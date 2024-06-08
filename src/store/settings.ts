// gridDataStore.ts
import { create } from 'zustand';
import { RgbColor } from 'react-colorful';
import { immer } from 'zustand/middleware/immer';

type GridSetting = {
  color: RgbColor;
  gridData: number[][];
  gridCommandData: number[]; // New field for computed value
};

type CodeSetting = {
  code: number[];
  timeInterval?: number;
};

type BlockSetting = {
  blockTime?: number;
};

export type SettingKey = 'mark' | 'block'; // Add as many as you need

type GridDataStore = {
  settings: {
    defaultGridSetting: GridSetting;
    codeSetting: CodeSetting;
    blockSetting: BlockSetting;
  } & {
    [K in SettingKey]?: GridSetting;
  };
} & Actions;

type Actions = {
  setGridData: (settingKey: SettingKey, rowIndex: number, columnIndex: number) => void;
  setColor: (settingKey: SettingKey, newColor: RgbColor) => void;
  updateCode: (newCode: string) => void;
  updateTimeInterval: (newTimeInterval?: number) => void;
  updateBlockTime: (newBlockTime?: number) => void;
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

export const updateGridSettingOrDefault = (
  state: GridDataStore,
  settingKey: SettingKey,
  updateFn: (setting: GridSetting) => void
) => {
  // Check if the settingKey exists, otherwise create a new one based on default
  state.settings[settingKey] = state.settings[settingKey] || { ...state.settings.defaultGridSetting };
  const setting = state.settings[settingKey];

  updateFn(setting!); // Apply the specific update logic to the setting
};

export const useGridDataStore = create<GridDataStore>()(
  immer((set) => ({
    settings: {
      defaultGridSetting: {
        color: { r: 200, g: 150, b: 35 },
        gridData: defaultGrid,
        gridCommandData: gridToCommandData(defaultGrid),
      },
      codeSetting: {
        code: [],
        timeInterval: undefined,
        timeIntervalInput: '',
      },
      blockSetting: {
        blockTime: undefined,
        blockTimeInput: '',
      },
    },
    setGridData: (settingKey, rowIndex, columnIndex) =>
      set((state) => {
        updateGridSettingOrDefault(state, settingKey, (setting) => {
          setting.gridData[rowIndex][columnIndex] = setting.gridData[rowIndex][columnIndex] === 0 ? 1 : 0;
          setting.gridCommandData = gridToCommandData(setting.gridData);
        });
      }),

    setColor: (settingKey, newColor) =>
      set((state) => {
        updateGridSettingOrDefault(state, settingKey, (setting) => {
          setting.color = newColor;
        });
      }),

    updateCode: (newCode: string) =>
      set((state) => {
        state.settings.codeSetting.code = newCode.split('').map((char) => parseInt(char, 10));
      }),

    updateTimeInterval: (newTimeInterval?: number) =>
      set((state) => {
        console.log('updateTimeInterval', newTimeInterval);
        state.settings.codeSetting.timeInterval = newTimeInterval;
      }),

    updateBlockTime: (newBlockTime?: number) =>
      set((state) => {
        console.log('updateBlockTime', newBlockTime);
        state.settings.blockSetting.blockTime = newBlockTime;
      }),
  }))
);
