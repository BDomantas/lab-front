import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type Tag = {
  tag: string;
  isSelected: boolean;
  isAssigned: boolean;
};

type TagLog = {
  timestamp: number;
  boxId: number;
  codeIndex?: number;
};

type CodeLog = {
  timestamp: number;
  codeIndex: number;
};

type Member = {
  name: string;
  score: number;
  tag: string;
  lastTag?: number;
  log: TagLog[];
  codeLog: CodeLog[];
};

export type Team = {
  name: string;
  members: Member[];
};

type BlockedBox = {
  boxId: number;
  blockStart: number;
  blockDuration: number;
};

type Game = {
  startTime?: number;
  currentTime: number;
  blockTime: number;
  blockedBoxes: BlockedBox[];
  isRunning: boolean;
  codeInterval: number;
};

const EMPTY_TAG = (tag: string): Tag => ({
  tag,
  isSelected: true,
  isAssigned: false,
});

const newMember = (name: string, tag: string): Member => ({
  name,
  score: 0,
  tag,
  log: [],
  codeLog: [],
});

const newTeam = (name: string): Team => ({ name, members: [] });

type GameDataStore = {
  tags: Tag[];
  teams: Team[];
  selectedTag: () => string | undefined;
  game: Game; // Add the game object to the store
} & Actions;

type Actions = {
  selectTag: (tag: string) => void;
  assignTag: (tag: string) => void;
  addTag: (tag: string) => void;
  addMember: (name: string, team: string, tag: string) => void;
  useTag: (tag: string, boxId: number) => { boxId: number; result: TagUseResult; member?: Member; code?: number };
  startGame: (blockTime: number, codeInterval: number) => void;
};

const INITIAL_STATE: GameDataStore = {
  tags: [],
  teams: [newTeam('Team A'), newTeam('Team B')],
  game: {
    currentTime: 0,
    blockTime: 0,
    blockedBoxes: [],
    isRunning: false,
    codeInterval: 1000 * 60 * 5,
  },
  selectedTag: () => undefined,
  selectTag: () => {},
  assignTag: () => {},
  addTag: () => {},
  addMember: () => {},
  useTag: () => ({ boxId: 0, result: TagUseResult.ERROR_GAME_NOT_RUNNING, member: undefined }),
  startGame: () => {},
};

export const tagExists = (state: GameDataStore, tag: string) => state.tags.some((t) => t.tag === tag);

export const removeMembersWithTag = (state: GameDataStore, tag: string) => {
  for (const team of state.teams) {
    team.members = team.members.filter((member) => member.tag !== tag);
  }
};

export const pushEmptyTag = (state: GameDataStore, tag: string) => {
  state.tags.push(EMPTY_TAG(tag));
};

export const assignTagToMember = (state: GameDataStore, name: string, team: string, tag: string) => {
  const foundTeamIndex = state.teams.findIndex((t) => t.name === team);
  if (foundTeamIndex !== -1) {
    state.teams[foundTeamIndex].members.push(newMember(name, tag));
  }
  const tagIndex = state.tags.findIndex((t) => t.tag === tag);
  if (tagIndex !== -1) {
    state.tags[tagIndex].isAssigned = true;
    state.tags[tagIndex].isSelected = false;
  }
};

export const assignTagHelper = (tags: Tag[], tag: string) => {
  for (const t of tags) {
    if (t.tag === tag) {
      t.isAssigned = true;
      t.isSelected = false;
    }
  }
};

export const modifyFirstTag = (tags: Tag[], tag: string) => {
  const index = tags.findIndex((t) => !t.isSelected && !t.isAssigned);
  if (index !== -1) {
    if (tag !== tags[index].tag) {
      tags[index].isSelected = true;
    }
  }
};

export const clearTagSelections = (tags: Tag[]) => {
  for (const t of tags) {
    t.isSelected = false;
  }
};

export const selectNewTag = (tags: Tag[], tag: string) => {
  for (const t of tags) {
    t.isSelected = false;
  }
  const index = tags.findIndex((t) => t.tag === tag);
  if (index !== -1) {
    tags[index].isSelected = true;
  }
};

const findMemberWithTag = (state: GameDataStore, tag: string): Member | undefined => {
  for (const team of state.teams) {
    for (const member of team.members) {
      if (member.tag === tag) {
        return member;
      }
    }
  }
  return undefined;
};

const increaseScoreAndUpdateLastTag = (member: Member): void => {
  member.score += 1;
  member.lastTag = Date.now();
};

const updateLog = (member: Member, boxId: number): void => {
  member.log.push({ timestamp: Date.now(), boxId });
};

export enum TagUseResult {
  MARK = 'MARK',
  BLOCKED = 'BLOCKED',
  ERROR_MEMBER_NOT_FOUND = 'ERROR_MEMBER_NOT_FOUND',
  ERROR_GAME_NOT_RUNNING = 'ERROR_GAME_NOT_RUNNING',
  CODE = 'CODE',
}

export const useGameStore = create<GameDataStore>()(
  immer((set, get) => ({
    ...INITIAL_STATE,
    addMember: (name, team, tag) =>
      set((state) => {
        removeMembersWithTag(state, tag);
        assignTagToMember(state, name, team, tag);
        modifyFirstTag(state.tags, tag);
      }),

    selectedTag: () => get().tags.find((t) => t.isSelected)?.tag,
    addTag: (tag) =>
      set((state) => {
        removeMembersWithTag(state, tag);

        clearTagSelections(state.tags);

        if (!tagExists(state, tag)) {
          pushEmptyTag(state, tag);
        }

        selectNewTag(state.tags, tag);

        // Sort tags (in-place mutation with Immer)
        state.tags.sort((a, b) => {
          if (a.isAssigned && !b.isAssigned) return 1;
          if (!a.isAssigned && b.isAssigned) return -1;
          return 0; // Maintain original order if both are the same
        });
      }),
    selectTag: (tag) =>
      set((state) => {
        clearTagSelections(state.tags);
        const selectedTagIndex = state.tags.findIndex((t) => t.tag === tag);
        if (selectedTagIndex !== -1) {
          state.tags[selectedTagIndex].isSelected = true;
        }
      }),
    assignTag: (tag) =>
      set((state) => {
        assignTagHelper(state.tags, tag);
      }),

    useTag: (tag, boxId) => {
      const currentTime = Date.now();
      let result: TagUseResult = TagUseResult.ERROR_GAME_NOT_RUNNING;
      let updatedMember: Member | undefined;
      let code: number | undefined;

      set((state) => {
        if (state.game.isRunning && state.game.startTime) {
          const member = findMemberWithTag(state, tag);
          updatedMember = member;

          if (member) {
            updateLog(member, boxId);

            if (!member.lastTag || currentTime - member.lastTag >= state.game.blockTime) {
              increaseScoreAndUpdateLastTag(member);

              const elapsedTime = currentTime - state.game.startTime;
              const expectedCodeIndex = Math.floor(elapsedTime / state.game.codeInterval);

              const hasCodeIndex = member.codeLog.some((log) => log.codeIndex === expectedCodeIndex);

              if (!hasCodeIndex) {
                member.codeLog.push({ timestamp: currentTime, codeIndex: expectedCodeIndex });
                code = expectedCodeIndex;
                result = TagUseResult.CODE;
              } else {
                result = TagUseResult.MARK;
              }
            } else {
              result = TagUseResult.BLOCKED;
            }
          } else {
            result = TagUseResult.ERROR_MEMBER_NOT_FOUND;
          }
        } else {
          result = TagUseResult.ERROR_GAME_NOT_RUNNING;
        }
      });

      return { boxId, result, member: updatedMember, code };
    },

    // New startGame action
    startGame: (blockTime, codeInterval) =>
      set((state) => {
        state.game = {
          startTime: Date.now(), // Record the start time
          currentTime: Date.now(), // Initialize currentTime with startTime
          blockTime,
          codeInterval,
          blockedBoxes: [],
          isRunning: true,
        };
      }),
  }))
);
