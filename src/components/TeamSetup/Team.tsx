import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Member, useGameStore, type Team } from '@/store/game';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import BlockInput from '../BlockInput';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';

interface Props {
  team: Team;
}

const Team: React.FC<Props> = ({ team }) => {
  if (!team) {
    return <div className="flex justify-center items-center">Team not found</div>;
  }
  const { game, setBlockUserSetting, blockUser, unBlockUser } = useGameStore();

  const { name, members } = team;

  const renderBlockSetting = (member: Member) => {
    const memberSetting = member.blockSetting;
    const isBlocked = memberSetting.isBlocked;

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Blokavimo nustatymai</DialogTitle>
          <DialogDescription>Žaidėjo blokavimo nustatymai</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full p-3">
          <div className="flex flex-col justify-center flex-grow align-middle">
            <div className="flex flex-col p-3">
              {isBlocked && !memberSetting.permanentBlock && (
                <Label>
                  {`Dėžutė užblokuota ${memberSetting.remainingTime ? Math.floor(memberSetting.remainingTime / 1000) : 0} sekundėms`}{' '}
                </Label>
              )}
              {isBlocked && memberSetting.permanentBlock && <Label>{`Dėžutė užblokuota be laiko nustatymo`} </Label>}
            </div>
            <div className="flex flex-row w-full space-x-2 pb-2 justify-center items-center h-full">
              <BlockInput
                title="Dėžutės blokavimas sekundėmis"
                placeholder="sekundės"
                value={memberSetting.blockDurationInput}
                onChange={(value) => setBlockUserSetting(member.tag, value)}
              />
              <div className="flex items-end justify-end space-x-2 pt-3">
                <Switch
                  onCheckedChange={(value) => setBlockUserSetting(member.tag, undefined, value)}
                  checked={memberSetting.permanentBlock}
                />
                <Label>Nenustatyti laiko</Label>
              </div>
            </div>
            <Button
              type="submit"
              disabled={!game.isRunning}
              onClick={() => (isBlocked ? unBlockUser(member.tag) : blockUser(member.tag))}
            >
              {isBlocked ? 'Atblokuoti' : 'Blokuoti'}
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <Table>
      <TableCaption align="top">{name}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Vardas</TableHead>
          <TableHead colSpan={2}>Magnetukas</TableHead>
          <TableHead className="text-right">Nustatymai</TableHead>
          <TableHead className="text-right">Taškai</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.tag} className={cn({ 'bg-yellow-300': member.blockSetting.isBlocked })}>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell colSpan={2}>{member.tag}</TableCell>
            <TableCell className="text-right justify-center align-middle">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size={'sm'}>
                    Keisti
                  </Button>
                </DialogTrigger>
                {renderBlockSetting(member)}
              </Dialog>
            </TableCell>
            <TableCell className="text-right">{member.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Komandos taškai</TableCell>
          <TableCell className="text-right">{members.reduce((a, b) => a + b.score ?? 0, 0)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default Team;
