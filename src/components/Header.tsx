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

interface HeaderProps {
  isConnected: boolean;
  ports?: Record<string, PortInfo>;
  onSelect: (value: string) => void;
  onOpen: () => void;
  onConnectPress: () => void;
}

interface SelectionProps {
  selections?: Record<string, PortInfo>;
}
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

export const Header = memo(({ isConnected, ports, onSelect, onOpen, onConnectPress }: HeaderProps) => {
  return (
    <header className="">
      <div className="flex items-center justify-between px-4 py-2">
        <h4 className="text-sm font-medium leading-none">Labirintai</h4>
        <div className="flex items-center space-x-4">
          <Select onValueChange={onSelect} onOpenChange={onOpen}>
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

          <Button onClick={onConnectPress}>Jungtis</Button>
        </div>
      </div>
      <Separator orientation="horizontal" />
    </header>
  );
});
