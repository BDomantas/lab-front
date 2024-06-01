import React, { useCallback, useEffect, useRef } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { useSystemStore } from '@/store/system';
import { getPanelElement, ImperativePanelHandle } from 'react-resizable-panels';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Input } from './ui/input';
import { Cross1Icon } from '@radix-ui/react-icons';
import { AspectRatio } from './ui/aspect-ratio';
interface Props {}

const getBoxID = (rowIndex: number) => (rowIndex + 1).toString().padStart(2, '0');
const StatusGrid: React.FC<Props> = ({}) => {
  const { statusGrid } = useSystemStore();
  const refs = useRef<ImperativePanelHandle | null>(null);

  const [isOpen, setIsOpen] = React.useState<number | null>(null);

  const handleCellPress = useCallback(
    (cellIndex: number) => {
      console.log('setting', cellIndex, isOpen);
      if (refs.current) {
        if (refs.current.isExpanded()) {
          if (isOpen === cellIndex) {
            refs.current.collapse();
            setIsOpen(null);
          } else {
            setIsOpen(cellIndex);
          }
        } else {
          refs.current.expand();
          setIsOpen(cellIndex);
        }
      }
    },
    [isOpen]
  );

  const handleClose = useCallback(() => {
    if (refs.current) {
      refs.current.collapse();
      setIsOpen(null);
    }
  }, []);

  return (
    <div className="flex flex-col">
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={70} minSize={70} className="justify-center align-middle">
          <div className="grid grid-cols-10 gap-1 p-2">
            {statusGrid.map((cell, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center">
                {/* Add width, height, and styling for each cell */}

                <Button
                  size="sm"
                  variant={'outline'}
                  className={cn(`w-10 h-10`, { 'bg-emerald-300': cell })}
                  onClick={() => handleCellPress(rowIndex)}
                >
                  <small className="text-sm font-medium leading-none">{getBoxID(rowIndex)}</small>
                </Button>
              </div>
            ))}
          </div>
        </ResizablePanel>
        <ResizableHandle disabled />
        <ResizablePanel defaultSize={0} collapsible minSize={30} id="settings" ref={refs}>
          <div className="flex flex-col h-full p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold flex-1">Dėžutė: {getBoxID(isOpen ?? 0)}</div>
              <Cross1Icon onClick={handleClose} />
            </div>
            <div className="flex flex-col justify-center flex-grow">
              <div className="flex w-full max-w-sm space-x-2">
                <Input type="time" placeholder="Blokavimo laikas" />
                <Button type="submit">Blokuoti</Button>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default StatusGrid;
