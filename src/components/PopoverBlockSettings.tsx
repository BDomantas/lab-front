import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGridDataStore } from '@/store/settings';

import BlockInput from './BlockInput';

interface Props {
  title: string;
  subtitle: string;
}

const PopoverBlockSetting: React.FC<Props> = ({ title, subtitle }) => {
  const { settings, updateBlockTime } = useGridDataStore();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">{title}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <BlockInput
            title="Blokavimo laikas sekundėmis"
            placeholder="Laiko intervalas"
            value={settings.blockSetting.blockTimeInput}
            onChange={updateBlockTime}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PopoverBlockSetting;
