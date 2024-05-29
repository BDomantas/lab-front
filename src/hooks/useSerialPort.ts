import { useRef } from 'react';
import { SerialPort, SerialportOptions } from 'tauri-plugin-serialplugin';

export function useSerialPort(portOptions?: SerialportOptions) {
  const serialPortRef = useRef<SerialPort>();
  if (!serialPortRef.current && portOptions) {
    serialPortRef.current = new SerialPort(portOptions);
  }
  return serialPortRef.current;
}
