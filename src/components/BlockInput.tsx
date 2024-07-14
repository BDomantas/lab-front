import React, { ChangeEvent, useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface Props {
  title: string;
  placeholder: string;
  value?: number;
  onChange: (value?: number) => void;
}

const BlockInput: React.FC<Props> = ({ title, placeholder, value, onChange }) => {
  // onChange handler that only accepts valid numeric input
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/[^0-9]/g, ''); // Filter non-numeric characters

    const parsedValue = parseInt(numericValue, 10); // Parse to number
    if (!isNaN(parsedValue)) {
      // Ensure the parsed value is valid
      onChange(parsedValue); // Call the provided update function
    } else {
      onChange(undefined); // Update the state to undefined if the parsed value is invalid
    }
  };

  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">{title}</Label>
      <Input
        type="text"
        id="time"
        placeholder={placeholder}
        inputMode="numeric"
        pattern="\d*"
        value={String(value ?? '')}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default BlockInput;
