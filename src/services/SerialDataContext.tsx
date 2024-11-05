import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useContextSelector, createContext } from 'use-context-selector'; // Make sure this is installed
import { SerialPortControlContext } from './SerialPortControlProvider';
import { TagUseResult, useGameStore } from '@/store/game';
import { useSystemStore } from '@/store/system';
import { StringDigits, useGridDataStore } from '@/store/settings';

type ReadDataResult = string;

export const SerialDataContext = createContext<ReadDataResult[]>([]);

const gridToCommandData = (grid: number[][]) => grid.map((row) => parseInt(row.join(''), 2));

const getTag = (msg: string) => {
  const numbers = msg.split(',').slice(5).map(Number);
  if (numbers.length === 8) {
    return numbers.map((num) => num.toString(16)).join('');
  }
  return '';
};

export const SerialDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const MAX_DATA_LENGTH = 20;
  const dataIndex = useRef(0);
  const [data, setData] = useState<string[]>([]); // For triggering re-renders

  const serialPort = useContextSelector(SerialPortControlContext, (context) => context.serialPort); // Correct usage of useContextSelector
  const unListenRef = useRef<() => void>(); // Ref to store the unlisten function

  const { addTag, useTag } = useGameStore();
  const { updateStatus, clearStatusGrid } = useSystemStore();
  const { settings: STORE } = useGridDataStore();

  // Use refs to store the latest STORE values
  const storeRef = useRef(STORE);

  useEffect(() => {
    storeRef.current = STORE;
  }, [STORE]);

  const handleTagR = (data: string) => {
    console.log('Received tag R:', data);
    // Check if data has 5 leading zeroes
    if (data.startsWith('0,0,0,0,0')) {
      // Extract the last 8 numbers
      const numbers = data.split(',').slice(5).map(Number);
      console.log('All numbers:', numbers);
      if (numbers.length === 8) {
        console.log('Parsed numbers:', numbers);
        addTag(numbers.map((num) => num.toString(16)).join(''));
      } else {
        console.error('Expected 8 numbers but found:', numbers.length);
      }
    }
  };

  const handleTagT = (data: string) => {
    console.log('Received tag T:', data);
    const tagData = data.split(',');
    const tag = getTag(data);
    const { result, boxId, code } = useTag(tag, parseInt(tagData[0], 10));
    console.log('Tag use result:', result, boxId, code);
    const currentStore = storeRef.current;
    if (result === TagUseResult.CODE) {
      if (code !== undefined) {
        const codeDigit = String(currentStore.codeSetting.code?.[code]) as StringDigits;
        console.log('Sending code:', code);
        // serialPort?.write(`${tagData[0]},${code}\n`);

        let codeSetting = currentStore?.[codeDigit];
        let displayConfig = { gridToCommandData: codeSetting?.gridCommandData, color: codeSetting?.color };
        if (!codeSetting) {
          displayConfig = {
            gridToCommandData: currentStore.mark?.gridCommandData ?? currentStore.defaultGridSetting.gridCommandData,
            color: currentStore.mark?.color ?? currentStore.defaultGridSetting.color,
          };
        }
        const codeCommand = `#BLOCK:${boxId},5,${displayConfig.color.r ?? 15},${displayConfig.color.g ?? 15},${displayConfig.color.b ?? 200},${displayConfig.gridToCommandData.join(',')}\n`;
        console.log('code cmd: ', codeCommand);
        serialPort?.write(codeCommand);
      }

      // console.log('Sending code:', code, settings.codeSetting.code?.[code]);
    }
    if (result === TagUseResult.MARK) {
      console.log('Sending mark:', boxId);
      const markCommand = `#BLOCK:${boxId},5,${currentStore.mark?.color.r ?? 50},${currentStore.mark?.color.g ?? 50},${currentStore.mark?.color.b ?? 50},${currentStore.mark?.gridCommandData.join(',')}\n`;
      console.log('mark cmd: ', markCommand);

      serialPort?.write(markCommand);
    }
    if (result === TagUseResult.BLOCKED) {
      console.log('Sending blocked:', boxId);
      const cmd = `#BLOCK:${boxId},5,${currentStore.block?.color.r ?? 255},${currentStore.block?.color.g ?? 255},${currentStore.block?.color.b ?? 255},${currentStore.block?.gridCommandData.join(',')}\n`;
      serialPort?.write(cmd);
    }

    if (result === TagUseResult.BOX_BLOCKED) {
      console.log('Sending box blocked:', boxId);
      const cmd = `#BLOCK:${boxId},5,${currentStore.boxBlock?.color.r ?? 255},${currentStore.boxBlock?.color.g ?? 255},${currentStore.boxBlock?.color.b ?? 255},${currentStore.boxBlock?.gridCommandData.join(',')}\n`;
      serialPort?.write(cmd);
    }

    if (result === TagUseResult.USER_BLOCKED) {
      console.log('Sending user blocked:', boxId);
      const cmd = `#BLOCK:${boxId},5,${currentStore.userBlock?.color.r ?? 255},${currentStore.userBlock?.color.g ?? 255},${currentStore.userBlock?.color.b ?? 255},${currentStore.userBlock?.gridCommandData.join(',')}\n`;
      serialPort?.write(cmd);
    }
  };

  const handleStatus = (data: string) => {
    console.log('Received status:', data);

    const status = data.split(':');
    //  console.log('status', status);
    if (status?.[0] === 'sendHealthCheck') {
      const isOnline = status?.[1] === 'NODE_OK';
      const NODE_ID = parseInt(status?.[3]);

      updateStatus(NODE_ID, isOnline);
    }
  };

  const handleMessage = (msg: string) => {
    // Check if the message starts with '#'
    if (msg.startsWith('#')) {
      // Find the index of ':'
      const colonIndex = msg.indexOf(':');
      // Extract the tag
      const command = msg.substring(1, colonIndex);
      // Extract the data
      const data = msg.substring(colonIndex + 1);

      console.log('handleMessage', command);

      // Use a switch statement to handle different tags
      switch (command) {
        case 'R':
          handleTagR(data);
          break;
        case 'STATUS':
          handleStatus(data);
          break;
        case 'T':
          handleTagT(data);
          break;
        default:
          // Do nothing for unknown tags
          break;
      }
    }
  };

  // Create a stable handleData callback using useCallback
  const handleData = useCallback(
    (result: ReadDataResult) => {
      try {
        console.log('handleData', result);
        setData((prevData) => {
          const newData = [...prevData];
          dataIndex.current = (dataIndex.current + 1) % MAX_DATA_LENGTH;
          newData[dataIndex.current] = result;
          return newData;
        });
        handleMessage(result);
      } catch (error) {
        console.error('Error in handleData:', error);
      }
    },
    [serialPort?.write]
  );

  useEffect(() => {
    const subscribeToData = async () => {
      if (serialPort) {
        try {
          unListenRef.current = await serialPort.listen(handleData);
        } catch (error) {
          console.error('Error subscribing to data:', error);
        }
      }
    };

    subscribeToData();

    return () => {
      console.log('calling cleanup');
      unListenRef.current?.(); // Call the unlisten function if it exists
    };
  }, [serialPort?.options.path, handleData]); // Include handleData in the dependency array

  return <SerialDataContext.Provider value={data}>{children}</SerialDataContext.Provider>;
};
