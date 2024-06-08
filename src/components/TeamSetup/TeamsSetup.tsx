import React, { useCallback, useMemo } from 'react';

import Team from './Team';

import { MagnetList } from './MagnetsList';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { useGameStore } from '@/store/game';
import { toast } from 'sonner';

interface Props {}
const TeamsSetup: React.FC<Props> = ({}) => {
  const { teams, addMember, selectedTag } = useGameStore();

  const [selectedTeam, setSelectedTeam] = React.useState<string>(teams?.[0]?.name ?? '');

  const [inputValue, setInputValue] = React.useState('');

  // Step 2: Define the onChange event handler to update the state
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const renderTeamSelects = useCallback(() => {
    return teams.map((team) => (
      <SelectItem key={team.name} value={team.name}>
        {team.name}
      </SelectItem>
    ));
  }, [teams]);

  const handleAddTeam = useCallback(() => {
    console.log('add team', selectedTeam);
    const currentTag = selectedTag();
    if (currentTag) {
      addMember(inputValue, selectedTeam, currentTag);
      toast.success('Žaidėjas pridėtas', {
        description: inputValue,
        duration: 2000,
      });
    } else {
      toast.error('Nepavyko pridėti žaidėjo', {
        description: 'Tags nepalaikomas',
        duration: 2500,
      });
    }
  }, [selectedTeam, selectedTag, inputValue]);

  return (
    <div>
      <div className="grid grid-cols-5 gap-4">
        {teams.map((team) => (
          <div className="col-span-2">
            <Team key={team.name} team={team} />
          </div>
        ))}
        <div className="col-span-1 flex justify-center items-center">
          <MagnetList />
        </div>
      </div>
      <div className="w-full flex justify-center items-center mt-4 px-10">
        <Input type="text" placeholder="Vardas" value={inputValue} onChange={handleChange} />
        <div className="w-1/4 flex justify-center items-center">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pasirinkite komandą" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Komanda</SelectLabel>
                {renderTeamSelects()}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/4 flex justify-center items-center">
          <small className="text-sm font-medium leading-none">{selectedTag()}</small>
        </div>

        <Button type="submit" onClick={handleAddTeam} disabled={!inputValue || !selectedTeam || !selectedTag()}>
          Pridėti
        </Button>
      </div>
    </div>
  );
};

export default TeamsSetup;
