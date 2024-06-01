import { useCallback, useEffect, useState } from 'react';
import { PortInfo, SerialPort, SerialportOptions } from 'tauri-plugin-serialplugin';
import { Header } from '@/components/Header';
import { Button } from './components/ui/button';
import { RgbColor } from 'react-colorful';

import './styles/global.css';
import PopoverComponent from './components/PopoverDisplayGridSetting';
import { SerialDataProvider } from './services/SerialDataContext';
import { SerialPortControlProvider } from './services/SerialPortControlProvider';
import { SerialDataDisplay } from './components/SerialDataDisplay';

export const RgbColorToString = (color: RgbColor) => `rgb(${color.r} ${color.g} ${color.b})`;

function App() {
  return (
    <SerialPortControlProvider>
      <SerialDataProvider>
        <div className="mx-auto">
          <Header />

          <PopoverComponent settingKey="mark" />
          <PopoverComponent settingKey="block" />
          <Button
            onClick={() => {
              // console.log('write', SerialInstance);
              // SerialInstance?.write(`#BLOCK:1,5,${color.r},${color.g},${color.b},${gridToDecimalString}\n`);
            }}
          >
            Write
          </Button>

          <SerialDataDisplay />
        </div>
      </SerialDataProvider>
    </SerialPortControlProvider>
  );
}

export default App;
