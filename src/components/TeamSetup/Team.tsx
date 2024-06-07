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
import { type Team } from '@/store/game';

interface Props {
  team: Team;
}

const Team: React.FC<Props> = ({ team }) => {
  if (!team) {
    return <div className="flex justify-center items-center">Team not found</div>;
  }
  const { name, members } = team;

  console.log(members);

  return (
    <Table>
      <TableCaption align="top">{name}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Vardas</TableHead>
          <TableHead colSpan={2}>Magnetukas</TableHead>
          <TableHead className="text-right">Taškai</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.tag}>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell colSpan={2}>{member.tag}</TableCell>
            <TableCell className="text-right">{member.score}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Komandos taškai</TableCell>
          <TableCell className="text-right">{members.reduce((a, b) => a + b.score ?? 0, 0)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default Team;
