import React, { useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { PortInfo, SerialPort, SerialportOptions } from 'tauri-plugin-serialplugin';
import { createContext } from 'use-context-selector'; // Make sure this is installed

interface SerialPortControlContextType {
  serialPort: SerialPort | null;
  isConnected: boolean;
  ports: Record<string, PortInfo> | null; // Available ports
  selectedPort: string | null; // Selected port path (can be null)
  getPorts: () => Promise<void>; // Function to fetch ports
  connect: (options: SerialportOptions) => void;
  disconnect: () => void;
  error: string | null;
  setSelectedPort: (path: string) => void;
}

export const SerialPortControlContext = createContext<SerialPortControlContextType>({
  serialPort: null,
  isConnected: false,
  ports: null, // Initial ports are null
  selectedPort: null,
  getPorts: async () => {}, // Placeholder function
  connect: () => {},
  disconnect: () => {},
  setSelectedPort: () => {},
  error: null,
});

export const SerialPortControlProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serialPort, setSerialPort] = useState<SerialPort | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false); // Add state for connection status
  const isMounted = useRef(true);
  const [ports, setPorts] = useState<Record<string, PortInfo> | null>(null);
  const [selectedPort, setSelectedPort] = useState<string | null>(null);

  const getPorts = useCallback(async () => {
    try {
      const availablePorts = await SerialPort.available_ports();
      console.log('getPorts', availablePorts);
      if (isMounted.current) {
        console.log('is it mounted ');
        setPorts(availablePorts);
      }
    } catch (error) {
      // ... (error handling, if needed)
    }
  }, []);

  useEffect(() => {
    getPorts(); // Fetch ports initially on component mount
  }, [getPorts]);

  useEffect(() => {
    if (isConnected) {
      getPorts(); // Refresh ports after connecting
    }
  }, [isConnected, getPorts]);

  const connect = async (options: SerialportOptions) => {
    const newSerialPort = new SerialPort(options);
    setSerialPort(newSerialPort);

    try {
      const error = await newSerialPort.open();
      newSerialPort.read();
      console.log(error);
      if (isMounted.current) {
        setIsConnected(true);
      }
    } catch (error) {
      console.log(error);
      if (isMounted.current) {
        setError(error.message);
      }
    }
  };

  const disconnect = async () => {
    // console.log('is this disconnected', await SerialPort.closeAll());
    // console.log('disco', serialPort?.unListen?.());

    try {
      serialPort?.cancelRead();
      serialPort?.close();
      SerialPort.closeAll();
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      console.log('disconnected');
      setSerialPort(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    return () => {
      // isMounted.current = false;
      console.log('mounted', isMounted);
      disconnect();
    };
  }, []);

  return (
    <SerialPortControlContext.Provider
      value={{ serialPort, isConnected, ports, selectedPort, getPorts, connect, disconnect, error, setSelectedPort }}
    >
      {children}
    </SerialPortControlContext.Provider>
  );
};
