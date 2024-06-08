import React, { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGridDataStore } from '@/store/settings';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Props {
  title: string;
  subtitle: string;
}

const PopoverBlockSetting: React.FC<Props> = ({ title, subtitle }) => {
  const { settings, updateBlockTime } = useGridDataStore();
  const [blockTimeInput, setBlockTimeInput] = useState(String(settings.blockSetting.blockTime ?? ''));

  // onChange handler that only accepts valid numeric input
  const handleBlockTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, ''); // Filter non-numeric characters

    // Always update the local state to reflect the filtered value
    setBlockTimeInput(numericValue);

    const parsedValue = parseInt(numericValue, 10); // Parse to number
    if (!isNaN(parsedValue)) {
      // Ensure the parsed value is valid
      updateBlockTime(parsedValue); // Call the provided update function
    } else {
      updateBlockTime(undefined); // Update the state to undefined if the parsed value is invalid
    }
  };

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
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Blokavimo laikas</Label>
            <Input
              type="text"
              id="time"
              placeholder="Laiko intervalas"
              inputMode="numeric"
              value={blockTimeInput}
              onChange={handleBlockTimeChange} // Use the specific handler
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PopoverBlockSetting;
