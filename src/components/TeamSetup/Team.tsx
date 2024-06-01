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

const team = [
  {
    name: 'Domantas',
    score: '1',
    tag: 'uuid:1',
  },
  {
    name: 'jacob',
    score: '110',
    tag: 'uuid:2',
  },
  {
    name: 'darwin',
    score: '110',
    tag: 'uuid:3',
  },
  {
    name: 'laura',
    score: '2',
    tag: 'uuid:4',
  },
  {
    name: 'emma',
    score: '20',
    tag: 'uuid:5',
  },
];
interface Props {
  name: string;
}

const Team: React.FC<Props> = ({ name }) => {
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
        {team.map((member) => (
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
          <TableCell className="text-right">{team.reduce((a, b) => a + parseInt(b.score, 10), 0)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

export default Team;
