import { useGameStore } from '@/store/game';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { cn } from '@/lib/utils';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

interface MagnetListProps {}

export const MagnetList = ({}: MagnetListProps) => {
  const { tags, selectedTag, selectTag } = useGameStore();

  const currentSelectedTag = selectedTag();

  console.log('ALLL TAGS', tags);
  return (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">Magnetukai</h4>
        <ToggleGroup
          type="single"
          orientation="vertical"
          variant={'outline'}
          value={currentSelectedTag}
          onValueChange={(value) => {
            console.log('value', value);
            if (value) selectTag(value);
          }}
          className="flex flex-col"
        >
          {tags.map((tag) => (
            <div key={tag.tag} className="relative">
              {currentSelectedTag === tag.tag && <ArrowLeftIcon className="h-4 w-4 absolute -right-4 top-1/4" />}
              <ToggleGroupItem value={tag.tag} className={cn({ 'bg-emerald-300': tag.isAssigned })}>
                <p>{tag.tag}</p>
              </ToggleGroupItem>
            </div>
          ))}
        </ToggleGroup>
      </div>
    </ScrollArea>
  );
};
