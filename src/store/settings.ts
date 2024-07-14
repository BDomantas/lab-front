// gridDataStore.ts
import { create } from 'zustand';
import { RgbColor } from 'react-colorful';
import { immer } from 'zustand/middleware/immer';
import { persist, devtools } from 'zustand/middleware';

type GridSetting = {
  color: RgbColor;
  gridData: number[][];
  gridCommandData: number[]; // New field for computed value
};

type CodeSetting = {
  code: number[];
  timeInterval?: number;
  timeIntervalInput?: number;
};

type BlockSetting = {
  blockTime?: number;
  blockTimeInput?: number;
};

export type StringDigits = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export type SettingKey = 'mark' | 'block' | 'boxBlock' | 'userBlock' | StringDigits; // Add as many as you need

type DigitSettings = { [K in StringDigits]: GridSetting };

type GridDataStore = {
  settings: {
    defaultGridSetting: GridSetting;
    codeSetting: CodeSetting;
    blockSetting: BlockSetting;
  } & {
    [K in SettingKey]?: GridSetting;
  } & DigitSettings;
} & Actions;

type Actions = {
  setGridData: (settingKey: SettingKey, rowIndex: number, columnIndex: number) => void;
  setColor: (settingKey: SettingKey, newColor: RgbColor) => void;
  updateCode: (newCode: string) => void;
  updateCodeTimeInterval: (newTimeInterval?: number) => void;
  updateBlockTime: (newBlockTime?: number) => void;
  clearGridData: (settingKey: SettingKey) => void;
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

const codeNumbers: number[][][] = [
  [
    // 0
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ],
  [
    // 1
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1],
  ],
  [
    // 2
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  [
    // 3
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ],
  [
    // 4
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
  ],
  [
    // 5
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ],
  [
    // 6
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ],
  [
    // 7
    [0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
  ],
  [
    // 8
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ],
  [
    // 9
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ],
];

const getDefaultCodeGridData = (settingKey: string) => {
  if (codeNumbers[parseInt(settingKey)]) {
    return codeNumbers[parseInt(settingKey)];
  }
};

// Define default settings for the digits
const digitSettings = Array.from({ length: 10 }, (_, i) => i.toString()).reduce<DigitSettings>((acc, digit) => {
  acc[digit as StringDigits] = {
    color: { r: 200, g: 150, b: 35 },
    gridData: getDefaultCodeGridData(digit) ?? defaultGrid,
    gridCommandData: gridToCommandData(getDefaultCodeGridData(digit) ?? defaultGrid),
  };
  return acc;
}, {} as DigitSettings);

export const updateGridSettingOrDefault = (
  state: GridDataStore,
  settingKey: SettingKey,
  updateFn: (setting: GridSetting) => void
) => {
  // Check if the settingKey exists, otherwise create a new one based on default
  let defaultGrid = { ...state.settings.defaultGridSetting };
  const defaultCodeGridData = getDefaultCodeGridData(settingKey);
  if (defaultCodeGridData) {
    defaultGrid.gridData = defaultCodeGridData;
  }

  state.settings[settingKey] = state.settings[settingKey] || defaultGrid;
  const setting = state.settings[settingKey];

  updateFn(setting!); // Apply the specific update logic to the setting
};

export const useGridDataStore = create<GridDataStore>()(
  devtools(
    persist(
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
            timeIntervalInput: undefined,
          },
          blockSetting: {
            blockTime: undefined,
            blockTimeInput: undefined,
          },
          ...digitSettings,
        },
        setGridData: (settingKey, rowIndex, columnIndex) =>
          set((state) => {
            updateGridSettingOrDefault(state, settingKey, (setting) => {
              setting.gridData[rowIndex][columnIndex] = setting.gridData[rowIndex][columnIndex] === 0 ? 1 : 0;
              setting.gridCommandData = gridToCommandData(setting.gridData);
            });
          }),

        clearGridData: (settingKey) =>
          set((state) => {
            updateGridSettingOrDefault(state, settingKey, (setting) => {
              const emptyGrid = Array.from({ length: 8 }, () => Array(8).fill(0));
              setting.gridData = emptyGrid;
              setting.gridCommandData = gridToCommandData(emptyGrid);
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

        updateCodeTimeInterval: (newTimeInterval?: number) =>
          set((state) => {
            console.log('updateTimeInterval', newTimeInterval);
            state.settings.codeSetting.timeInterval = (newTimeInterval ?? 0) * 1000;
            state.settings.codeSetting.timeIntervalInput = newTimeInterval;
          }),

        updateBlockTime: (newBlockTime?: number) =>
          set((state) => {
            console.log('updateBlockTime', newBlockTime);
            state.settings.blockSetting.blockTime = (newBlockTime ?? 0) * 1000;
            state.settings.blockSetting.blockTimeInput = newBlockTime;
          }),
      })),
      { name: 'settingsStore' }
    )
  )
);
