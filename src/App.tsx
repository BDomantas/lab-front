import { useCallback, useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './styles/global.css';
import { PortInfo, SerialPort, SerialportOptions } from 'tauri-plugin-serialplugin';
import { Header } from '@/components/Header';
import { useSerialPort } from '@/hooks/useSerialPort';
import { Button } from './components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover';
import { FontItalicIcon, SunIcon } from '@radix-ui/react-icons';
import { Toggle } from './components/ui/toggle';
import { RgbColor } from 'react-colorful';
import { PopoverPicker } from './components/PopoverPicker';

const BAUD_RATE = 115200;
const initialData = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
];

export const RgbColorToString = (color: RgbColor) => `rgb(${color.r} ${color.g} ${color.b})`;

function App() {
  const [gridData, setGridData] = useState(initialData);
  // Function to handle cell press
  const handleCellPress = (rowIndex, columnIndex) => {
    const newData = [...gridData];
    newData[rowIndex][columnIndex] = newData[rowIndex][columnIndex] === 0 ? 1 : 0;
    setGridData(newData);
  };
  const [ports, setPorts] = useState<Record<string, PortInfo>>();
  const [connectionConfig, setConnectionConfig] = useState<SerialportOptions>();
  const [color, setColor] = useState<RgbColor>({ r: 200, g: 150, b: 35 });

  const SerialInstance = useSerialPort(connectionConfig);

  const getPorts = useCallback(async () => {
    const availablePorts = await SerialPort.available_ports();
    setPorts(availablePorts);
  }, [setPorts]);

  const onConnectPress = useCallback(async () => {
    const result = await SerialInstance?.open();
    const test = await SerialInstance?.read();
    console.log('test', test);
    SerialInstance?.listen((arr) => console.log(arr));
  }, [SerialInstance]);

  useEffect(() => {
    getPorts();
  }, [getPorts]);

  const attemptConnection = useCallback((selection: string) => {
    setConnectionConfig({ path: selection, baudRate: BAUD_RATE, stopBits: 1 });
  }, []);

  // Memoized function to convert grid data to decimal values separated by commas
  const gridToDecimalString = useMemo(() => {
    return gridData.map((row) => parseInt(row.join(''), 2)).join(',');
  }, [gridData]);

  useEffect(() => {
    console.log(gridToDecimalString);
  }, [gridToDecimalString]);

  return (
    <div className="mx-auto">
      <Header
        isConnected
        onSelect={attemptConnection}
        ports={ports}
        onOpen={getPorts}
        onConnectPress={onConnectPress}
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Užskaitymo vaizdas</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Dėžutė parodys šį vaizdą po sėkmingo pažymėjimo</p>
            </div>
            <PopoverPicker color={color} onChange={setColor} />
            <div className="grid grid-cols-8 gap-2">
              {gridData.map((row, rowIndex) =>
                row.map((cell, columnIndex) => (
                  <div key={`${rowIndex}-${columnIndex}`}>
                    <Toggle
                      size="sm"
                      color={color}
                      variant={'default'}
                      aria-label="Toggle italic"
                      pressed={cell === 1} // Check if cell is pressed
                      onPressedChange={() => handleCellPress(rowIndex, columnIndex)} // Handle cell press
                    >
                      <SunIcon className="h-4 w-4" />
                    </Toggle>
                  </div>
                ))
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        onClick={() => {
          console.log('write', SerialInstance);
          SerialInstance?.write(`#BLOCK:1,5,255,255,255,${gridToDecimalString}\n`);
        }}
      >
        Write
      </Button>
    </div>
  );
}

export default App;
