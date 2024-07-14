import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Toggle } from '@/components/ui/toggle';
import { PopoverColorPicker } from '@/components/PopoverColorPicker';
import { SunIcon } from '@radix-ui/react-icons';
import { StringDigits, useGridDataStore } from '@/store/settings';
import { RgbColor } from 'react-colorful';
import { Label } from './ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';

interface Props {
  title: string;
  subtitle: string;
}

const PopoverCodeGridSetting: React.FC<Props> = ({ title, subtitle }) => {
  const { settings, setGridData, setColor, clearGridData } = useGridDataStore();

  const [selectedCode, setSelectedCode] = React.useState<StringDigits>('0');

  const onSelectChange = (value: string) => {
    setSelectedCode(value as StringDigits);
  };

  const handleCellPress = (rowIndex: number, columnIndex: number) => {
    setGridData(selectedCode, rowIndex, columnIndex);
  };

  const color = settings?.[selectedCode]?.color ?? settings.defaultGridSetting.color;
  const gridData = settings?.[selectedCode]?.gridData ?? settings.defaultGridSetting.gridData;

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
            <Label>Kodas</Label>
            <Select onValueChange={onSelectChange} value={selectedCode}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pasirinkite kodą" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Kodas</SelectLabel>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {String(index)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label>Spalva</Label>
            <PopoverColorPicker color={color} onChange={(newColor: RgbColor) => setColor(selectedCode, newColor)} />
          </div>
          <Button variant="destructive" onClick={() => clearGridData(selectedCode)}>
            Išvalyti
          </Button>
          <div className="grid grid-cols-8 gap-2">
            {gridData.map((row, rowIndex) =>
              row.map((cell, columnIndex) => (
                <div key={`${selectedCode}-${rowIndex}-${columnIndex}`}>
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

export default PopoverCodeGridSetting;
