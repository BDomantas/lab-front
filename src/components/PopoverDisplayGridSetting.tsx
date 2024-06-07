import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Toggle } from '@/components/ui/toggle';
import { PopoverColorPicker } from '@/components/PopoverColorPicker';
import { SunIcon } from '@radix-ui/react-icons';
import { SettingKey, useGridDataStore } from '@/store/settings';
import { RgbColor } from 'react-colorful';

interface Props {
  settingKey: SettingKey;
  title: string;
  subtitle: string;
}

const PopoverComponent: React.FC<Props> = ({ settingKey, title, subtitle }) => {
  const { settings, setGridData, setColor } = useGridDataStore();

  const handleCellPress = (rowIndex: number, columnIndex: number) => {
    console.log('setting');
    setGridData(settingKey, rowIndex, columnIndex);
  };

  const color = settings?.[settingKey]?.color ?? settings.defaultGridSetting.color;
  const gridData = settings?.[settingKey]?.gridData ?? settings.defaultGridSetting.gridData;

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
          <PopoverColorPicker color={color} onChange={(newColor: RgbColor) => setColor(settingKey, newColor)} />
          <div className="grid grid-cols-8 gap-2">
            {gridData.map((row, rowIndex) =>
              row.map((cell, columnIndex) => (
                <div key={`${rowIndex}-${columnIndex}`}>
                  <Toggle
                    size="sm"
                    activeColor={color}
                    variant={'default'}
                    aria-label="Toggle italic"
                    pressed={cell === 1}
                    onPressedChange={() => handleCellPress(rowIndex, columnIndex)}
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
  );
};

export default PopoverComponent;
