import { useContextSelector } from 'use-context-selector';
import { SerialDataContext } from '@/services/SerialDataContext';

export function SerialDataDisplay() {
  const data = useContextSelector(SerialDataContext, (context) => context);

  return (
    <div>
      <h2>Received Data:</h2>
      <pre>{data}</pre>
    </div>
  );
}
