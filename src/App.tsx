import { Header } from '@/components/Header';
import { Button } from './components/ui/button';
import { RgbColor } from 'react-colorful';

import './styles/global.css';
import PopoverComponent from './components/PopoverDisplayGridSetting';
import { SerialDataProvider } from './services/SerialDataContext';
import { SerialPortControlProvider } from './services/SerialPortControlProvider';

import StatusGrid from './components/StatusGrid';

import React from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './components/ui/collapsible';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';
import { Separator } from '@radix-ui/react-separator';
import TeamsSetup from './components/TeamSetup/TeamsSetup';
import { Toaster } from './components/ui/sonner';
import PopoverSetting from './components/PopoverSettings';

export const RgbColorToString = (color: RgbColor) => `rgb(${color.r} ${color.g} ${color.b})`;

function App() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SerialPortControlProvider>
      <SerialDataProvider>
        <div className="mx-auto">
          <Header />

          <PopoverComponent
            settingKey="mark"
            title="Užskaitymo vaizdas"
            subtitle="Dėžutė parodys šį vaizdą po sėkmingo pažymėjimo"
          />
          <PopoverComponent
            settingKey="block"
            title="Blokavimo vaizdas"
            subtitle="Dėžutė parodys šį vaizdą po sėkmingo blokavimo"
          />

          <PopoverSetting title="Kodas" subtitle="Dėžutė parodys kodą kas nustatytą laiko intervalą" />

          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full my-2">
            <div className="">
              <Separator className="w-full bg-border h-[1px]" orientation="horizontal" />
              <div className="flex items-center justify-between space-x-4 px-4">
                <h4 className="text-sm font-semibold">Dėžučių statusai</h4>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {isOpen ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="space-y-2">
                <StatusGrid />
              </CollapsibleContent>

              <Separator className="w-full bg-border h-[1px] my-2" orientation="horizontal" />
            </div>
          </Collapsible>
        </div>
        <TeamsSetup />
        <Button
          onClick={() => {
            // console.log('write', SerialInstance);
            // SerialInstance?.write(`#BLOCK:1,5,${color.r},${color.g},${color.b},${gridToDecimalString}\n`);
          }}
        >
          START
        </Button>
        <Toaster />
      </SerialDataProvider>
    </SerialPortControlProvider>
  );
}

export default App;
