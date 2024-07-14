import React, { useCallback, useRef } from 'react';
import { useSystemStore } from '@/store/system';
import { ImperativePanelHandle } from 'react-resizable-panels';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useGameStore } from '@/store/game';
import BlockInput from './BlockInput';

import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { SerialPortControlContext } from '@/services/SerialPortControlProvider';
import { useContextSelector } from 'use-context-selector';
import { useGridDataStore } from '@/store/settings';

interface Props {}

export const getBoxID = (rowIndex: number) => rowIndex.toString().padStart(2, '0');

const StatusGrid: React.FC<Props> = ({}) => {
  const { statusGrid } = useSystemStore();
  const { game, setBlockBoxSetting, blockBox, unBlockBox, boxSettings } = useGameStore();
  const refs = useRef<ImperativePanelHandle | null>(null);

  const [openBoxId, setIsOpen] = React.useState<number | null>(null);

  const serialPort = useContextSelector(SerialPortControlContext, (context) => context.serialPort); // Correct usage of useContextSelector
  const { settings } = useGridDataStore();

  const handleCellPress = useCallback(
    (cellIndex: number) => {
      console.log('handleCellPress', cellIndex);
      if (refs.current) {
        if (refs.current.isExpanded()) {
          if (openBoxId === cellIndex) {
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
    [openBoxId]
  );

  const handleClose = useCallback(() => {
    if (refs.current) {
      refs.current.collapse();
      setIsOpen(null);
    }
  }, []);

  const handleTest = useCallback(
    (boxId: number) => {
      const displayConfig = settings.mark;
      const cmd = `#BLOCK:${boxId},3,${settings.mark?.color.r ?? 15},${displayConfig?.color.g ?? 15},${displayConfig?.color.b ?? 200},${displayConfig?.gridCommandData.join(',')}\n`;
      serialPort?.write(cmd);
    },
    [serialPort?.options.path, settings.mark]
  );

  const renderSetting = (boxIndex: number | null) => {
    const boxId = boxIndex ? boxIndex + 1 : null;
    if (boxId !== null && boxId !== undefined) {
      const boxSetting = boxSettings?.[boxId];
      const isBlocked = boxSetting?.isBlocked;
      return (
        <div className="flex flex-col h-full p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-lg font-semibold flex-1">Dėžutė: {getBoxID(boxId)}</div>
            <Button
              variant="secondary"
              size="lg"
              className="w-9 bg-emerald-200 px-10 mr-10"
              onClick={() => handleTest(boxId)}
            >
              TEST
            </Button>
            <Cross1Icon onClick={handleClose} />
          </div>
          <div className="flex flex-col justify-center flex-grow align-middle">
            <div className="flex flex-col p-3">
              {isBlocked && !boxSetting.permanentBlock && (
                <Label>
                  {`Dėžutė užblokuota ${boxSetting.remainingTime ? Math.floor(boxSetting.remainingTime / 1000) : 0} sekundėms`}{' '}
                </Label>
              )}
              {isBlocked && boxSetting.permanentBlock && <Label>{`Dėžutė užblokuota be laiko nustatymo`} </Label>}
            </div>
            <div className="flex flex-row w-full space-x-2 pb-2 justify-center items-center h-full">
              <BlockInput
                title="Dėžutės blokavimas sekundėmis"
                placeholder="sekundės"
                value={boxSettings?.[boxId]?.blockDurationInput}
                onChange={(value) => setBlockBoxSetting(boxId, value)}
              />
              <div className="flex items-end justify-end space-x-2 pt-3">
                <Switch
                  onCheckedChange={(value) => setBlockBoxSetting(boxId, undefined, value)}
                  checked={boxSettings?.[boxId]?.permanentBlock}
                />
                <Label>Nenustatyti laiko</Label>
              </div>
            </div>
            <Button
              type="submit"
              disabled={!game.isRunning}
              onClick={() => (isBlocked ? unBlockBox(boxId) : blockBox(boxId))}
            >
              {isBlocked ? 'Atblokuoti' : 'Blokuoti'}
            </Button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col">
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        <ResizablePanel defaultSize={70} minSize={70} className="justify-center align-middle">
          <div className="grid grid-cols-10 gap-1 p-2">
            {statusGrid.map((cell, rowIndex) => (
              <div key={rowIndex} className="flex items-center justify-center">
                <Button
                  size="sm"
                  variant={'outline'}
                  className={cn(
                    `w-10 h-10`,
                    { 'bg-emerald-300': cell },
                    { 'bg-yellow-300': boxSettings?.[rowIndex + 1]?.isBlocked }
                  )}
                  onClick={() => handleCellPress(rowIndex)}
                >
                  <small className="text-sm font-medium leading-none">{getBoxID(rowIndex + 1)}</small>
                </Button>
              </div>
            ))}
          </div>
        </ResizablePanel>
        <ResizableHandle disabled />
        <ResizablePanel defaultSize={0} collapsible minSize={30} id="settings" ref={refs}>
          {renderSetting(openBoxId)}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default StatusGrid;
