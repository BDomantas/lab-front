import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGridDataStore } from '@/store/settings';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Label } from './ui/label';
import BlockInput from './BlockInput';

interface Props {
  title: string;
  subtitle: string;
}

const PopoverCodeSetting: React.FC<Props> = ({ title, subtitle }) => {
  const { settings, updateCode, updateCodeTimeInterval } = useGridDataStore();

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

          <BlockInput
            title="Laiko intervalas sekundėmis"
            placeholder="Laiko intervalas"
            value={settings.codeSetting.timeIntervalInput}
            onChange={updateCodeTimeInterval}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PopoverCodeSetting;
