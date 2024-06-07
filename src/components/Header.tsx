import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select';
import { PortInfo } from 'tauri-plugin-serialplugin';
import { memo } from 'react';
import { useContextSelector } from 'use-context-selector'; // Make sure this is installed
import { SerialPortControlContext } from '@/services/SerialPortControlProvider';

interface HeaderProps {}

interface SelectionProps {
  selections?: Record<string, PortInfo> | null;
}
const BAUD_RATE = 115200;

const Selections = ({ selections }: SelectionProps) => {
  if (!selections) {
    return null;
  }
  return (
    <>
      {Object.entries(selections).map(([key, value]) => (
        <SelectItem key={key} value={key}>
          {key}
        </SelectItem>
      ))}
    </>
  );
};

export const Header = memo(({}: HeaderProps) => {
  const { ports, selectedPort, isConnected, getPorts, connect, setSelectedPort } = useContextSelector(
    SerialPortControlContext,
    (context) => context // Select all values from context
  );

  const handleSelect = (portPath: string) => {
    setSelectedPort(portPath); // Assuming you have setSelectedPort from the context
  };

  const handleOpen = () => {
    getPorts();
  };

  const handleConnect = () => {
    if (selectedPort) {
      // Use the `selectedPort` to connect
      try {
        connect({
          path: selectedPort,

          baudRate: BAUD_RATE,
          stopBits: 1,
        });
      } catch (error) {
        console.error('Error connecting to port:', error);
      }
    }
  };
  return (
    <header className="">
      <div className="flex items-center justify-between px-4 py-2">
        <h4 className="text-sm font-medium leading-none">Labirintai</h4>
        <div className="flex items-center space-x-4">
          <Select onValueChange={handleSelect} onOpenChange={handleOpen}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Valdiklis" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{ports ? 'USB' : 'Prijunkite valdiklį'}</SelectLabel>
                <Selections selections={ports} />
              </SelectGroup>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-8" />
          <Badge
            variant="secondary"
            className={cn(
              isConnected && 'bg-emerald-500 hover:bg-emerald-500',
              'disabled:pointer-events-none',
              'transition-none',
              'cursor-default'
            )}
          >
            OK
          </Badge>

          <Separator orientation="vertical" className="h-8" />

          <Button onClick={handleConnect}>Jungtis</Button>
        </div>
      </div>
      <Separator orientation="horizontal" />
    </header>
  );
});
