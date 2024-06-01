import React from 'react';
interface Props {}
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import Team from './Team';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { TextAlignLeftIcon } from '@radix-ui/react-icons';

const tags = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`);

const TeamsSetup: React.FC<Props> = ({}) => {
  const [value, setValue] = React.useState('left');

  return (
    <div className="grid grid-cols-5 gap-4">
      <div className="col-span-2">
        <Team name="Komanda B" />
      </div>
      <div className="col-span-2">
        <Team name="Komanda A" />
      </div>
      <div className="col-span-1">
        <ScrollArea className="h-72 w-48 rounded-md border">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium leading-none">Magnetukai</h4>
            <ToggleGroup
              type="single"
              orientation="vertical"
              variant={'outline'}
              value={value}
              onValueChange={(value) => {
                console.log('value', value);
                if (value) setValue(value);
              }}
              className="flex flex-col"
            >
              {tags.map((tag) => (
                <div key={tag}>
                  <ToggleGroupItem value={tag} color="red">
                    <p>{tag}</p>
                  </ToggleGroupItem>
                  <Separator orientation="horizontal" />
                </div>
              ))}
            </ToggleGroup>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default TeamsSetup;
