import React, { useCallback, useRef, useState } from 'react';
import { RgbColorPicker, RgbColor } from 'react-colorful';
import useClickOutside from './useClickOutside';
import { RgbColorToString } from '@/App';

interface PopoverPickerProps {
  color: RgbColor;
  onChange: (color: RgbColor) => void;
}

export const PopoverColorPicker = ({ color, onChange }: PopoverPickerProps) => {
  const popover = useRef(null);
  const [isOpen, toggle] = useState(false);

  const close = useCallback(() => toggle(false), []);
  useClickOutside(popover, close);

  return (
    <div className="relative">
      <div
        className="w-12 h-12 rounded-md border-3 border-white shadow-md cursor-pointer"
        style={{ backgroundColor: RgbColorToString(color) }}
        onClick={() => toggle(true)}
      />

      {isOpen && (
        <div className="absolute top-full left-0 rounded-lg shadow-lg" ref={popover}>
          <RgbColorPicker color={color} onChange={onChange} />
        </div>
      )}
    </div>
  );
};
