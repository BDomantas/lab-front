import React, { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { useContextSelector, createContext } from 'use-context-selector'; // Make sure this is installed
import { SerialPortControlContext } from './SerialPortControlProvider';
import { useGameStore } from '@/store/game';
import { SerialPort } from 'tauri-plugin-serialplugin';
import { useSystemStore } from '@/store/system';

type ReadDataResult = string;

export const SerialDataContext = createContext<ReadDataResult[]>([]);

export const SerialDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const MAX_DATA_LENGTH = 20;
  const dataIndex = useRef(0);
  const [data, setData] = useState<string[]>([]); // For triggering re-renders

  const serialPort = useContextSelector(SerialPortControlContext, (context) => context.serialPort); // Correct usage of useContextSelector
  const unListenRef = useRef<() => void>(); // Ref to store the unlisten function

  const { addTag } = useGameStore();
  const { updateStatus } = useSystemStore();

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

  const handleStatus = (data: string) => {
    console.log('Received status:', data);
    const status = data.split(':');
    console.log('status', status);
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
        default:
          // Do nothing for unknown tags
          break;
      }
    }
  };

  // Create a stable handleData callback using useCallback
  const handleData = useCallback((result: ReadDataResult) => {
    try {
      // console.log('handleData', result);
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
  }, []);

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
  }, [serialPort, handleData]); // Include handleData in the dependency array

  return <SerialDataContext.Provider value={data}>{children}</SerialDataContext.Provider>;
};
