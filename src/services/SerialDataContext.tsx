import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { useContextSelector, createContext } from 'use-context-selector'; // Make sure this is installed
import { SerialPortControlContext } from './SerialPortControlProvider';

type ReadDataResult = string;

export const SerialDataContext = createContext<ReadDataResult[]>([]);

export const SerialDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const MAX_DATA_LENGTH = 20;
  const dataIndex = useRef(0);
  const [data, setData] = useState<string[]>([]); // For triggering re-renders

  const serialPort = useContextSelector(SerialPortControlContext, (context) => context.serialPort); // Correct usage of useContextSelector

  useEffect(() => {
    const handleData = (result: ReadDataResult) => {
      try {
        setData((prevData) => {
          const newData = [...prevData]; // Create a copy of the previous data array
          dataIndex.current = (dataIndex.current + 1) % MAX_DATA_LENGTH;
          newData[dataIndex.current] = result; // Update the specific index with the new result
          return newData; // Return the updated array
        });
        console.log(result);
      } catch (error) {
        console.error('Error in handleData:', error);
        // Consider displaying the error to the user or logging it for further analysis
      }
    };

    console.log('from data context', serialPort);

    serialPort?.listen(handleData).catch((error) => console.error('Listen error:', error));

    return () => {
      serialPort?.cancelListen();
    };
  }, [serialPort]); // Re-subscribe when serialPort changes

  return <SerialDataContext.Provider value={data}>{children}</SerialDataContext.Provider>;
};
