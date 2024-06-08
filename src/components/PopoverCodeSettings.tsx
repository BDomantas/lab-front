import React, { ChangeEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGridDataStore } from '@/store/settings';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Props {
  title: string;
  subtitle: string;
}

const PopoverCodeSetting: React.FC<Props> = ({ title, subtitle }) => {
  const { settings, updateCode, updateTimeInterval } = useGridDataStore();
  const [codeIntervalInput, setCodeIntervalInput] = useState(String(settings.blockSetting.blockTime ?? ''));

  // onChange handler that only accepts valid numeric input
  const handleCodeIntevalChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, ''); // Filter non-numeric characters

    // Always update the local state to reflect the filtered value
    setCodeIntervalInput(numericValue);

    const parsedValue = parseInt(numericValue, 10); // Parse to number
    if (!isNaN(parsedValue)) {
      // Ensure the parsed value is valid
      updateTimeInterval(parsedValue); // Call the provided update function
    } else {
      updateTimeInterval(undefined); // Update the state to undefined if the parsed value is invalid
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
            <Label htmlFor="email">Kodas</Label>
            <InputOTP
              maxLength={8}
              pattern={REGEXP_ONLY_DIGITS}
              value={settings.codeSetting.code.join('')}
              onChange={updateCode}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
                <InputOTPSlot index={6} />
                <InputOTPSlot index={7} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Laiko intervalas minutėmis</Label>
            <Input
              type="text"
              id="time"
              placeholder="Laiko intervalas"
              inputMode="numeric"
              pattern="\d*"
              value={codeIntervalInput}
              onChange={handleCodeIntevalChange}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PopoverCodeSetting;
