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

export type Team = {
  name: string;
  members: Member[];
};

type EntityBlockSetting = {
  entityId: number;
  blockStart?: number;
  blockDuration?: number;
  blockEnd?: number;
  blockDurationInput?: number;
  permanentBlock: boolean;
  isBlocked: boolean;
  remainingTime?: number;
};

export type Member = {
  name: string;
  score: number;
  tag: string;
  lastTag: Record<string, number>;
  log: TagLog[];
  codeLog: CodeLog[];
  blockSetting: EntityBlockSetting;
};

type Game = {
  startTime?: number;
  currentTime: number;
  blockTime: number;
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
  lastTag: {},
  blockSetting: getEmptyBlockEntitySetting(0),
});

const newTeam = (name: string): Team => ({ name, members: [] });

type GameDataStore = {
  tags: Tag[];
  teams: Team[];
  selectedTag: () => string | undefined;
  game: Game; // Add the game object to the store
  boxSettings: Record<number, EntityBlockSetting>;
} & Actions;

type Actions = {
  selectTag: (tag: string) => void;
  assignTag: (tag: string) => void;
  addTag: (tag: string) => void;
  addMember: (name: string, team: string, tag: string) => void;
  useTag: (tag: string, boxId: number) => { boxId: number; result: TagUseResult; member?: Member; code?: number };
  startGame: (blockTime?: number, codeInterval?: number) => void;
  blockBox: (boxId: number) => void;
  unBlockBox: (boxId: number) => void;
  setBlockBoxSetting: (boxId: number, blockDuration?: number, permanentBlock?: boolean) => void;
  updateBoxBlockTimers: () => void;
  blockUser: (tag: string) => void;
  unBlockUser: (tag: string) => void;
  setBlockUserSetting: (tag: string, blockDuration?: number, permanentBlock?: boolean) => void;
  updateUserBlockTimers: () => void;
  pauseGame: () => void;
  resetGame: () => void;
};

const getEmptyBlockEntitySetting = (boxId: number): EntityBlockSetting => ({
  entityId: boxId,
  permanentBlock: false,
  isBlocked: false,
});

const initialBoxSettings = Array.from({ length: 51 }, (_, i) => getEmptyBlockEntitySetting(i));

const INITIAL_STATE: GameDataStore = {
  tags: [],
  teams: [newTeam('Team A'), newTeam('Team B')],
  game: {
    currentTime: 0,
    blockTime: 0,
    isRunning: false,
    codeInterval: 1000 * 60 * 5,
  },
  boxSettings: initialBoxSettings,
  selectedTag: () => undefined,
  selectTag: () => {},
  assignTag: () => {},
  addTag: () => {},
  addMember: () => {},
  useTag: () => ({ boxId: 0, result: TagUseResult.ERROR_GAME_NOT_RUNNING, member: undefined }),
  startGame: () => {},
  blockBox: () => {},
  pauseGame: () => {},
  resetGame: () => {},
  setBlockBoxSetting: () => {},
  unBlockBox: () => {},
  updateBoxBlockTimers: () => {},
  blockUser: () => {},
  unBlockUser: () => {},
  setBlockUserSetting: () => {},
  updateUserBlockTimers: () => {},
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
  // member.lastTag = Date.now();
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
  BOX_BLOCKED = 'BOX_BLOCKED',
  USER_BLOCKED = 'USER_BLOCKED',
}

function findHighestCodeIndexEntry(codeLog: CodeLog[]): CodeLog | null {
  let highestIndexEntry: CodeLog | null = null;

  for (const entry of codeLog) {
    if (highestIndexEntry === null || entry.codeIndex > highestIndexEntry.codeIndex) {
      highestIndexEntry = entry;
    }
  }

  return highestIndexEntry;
}

const isBoxBlocked = (boxId: number, boxSettings: Record<number, EntityBlockSetting>) => {
  return boxSettings[boxId]?.isBlocked;
};

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

    // Modified useTag action
    useTag: (tag, boxId) => {
      const currentTime = Date.now();
      let result: TagUseResult = TagUseResult.ERROR_GAME_NOT_RUNNING; // No default value, it will be set later
      let updatedMember: Member | undefined;
      let code: number | undefined;

      set((state) => {
        if (state.game.isRunning && state.game.startTime) {
          const member = findMemberWithTag(state, tag);
          updatedMember = member;

          if (member) {
            updateLog(member, boxId);
            console.log(
              'CHECK CHECK',
              member?.lastTag[tag] >= state.game.blockTime,
              state.game.blockTime,
              member?.lastTag[tag]
            );

            if (isBoxBlocked(boxId, state.boxSettings)) {
              result = TagUseResult.BOX_BLOCKED;
            } else if (member.blockSetting.isBlocked) {
              result = TagUseResult.USER_BLOCKED;
            } else if (!member.lastTag?.[tag] || currentTime - (member.lastTag?.[tag] ?? 0) >= state.game.blockTime) {
              increaseScoreAndUpdateLastTag(member);

              // Code generation logic

              const elapsedTime = currentTime - state.game.startTime;
              // Check if elapsedTime is greater than or equal to codeInterval * (expectedCodeIndex + 1)
              const expectedCodeIndex = Math.floor(elapsedTime / state.game.codeInterval);
              const hasCodeIndex = member.codeLog.some((log) => log.codeIndex === expectedCodeIndex);
              const lastCode = findHighestCodeIndexEntry(member.codeLog)?.codeIndex;

              console.log(
                'elapsedTime',
                elapsedTime,
                'expectedCodeIndex',
                expectedCodeIndex,
                'hasCodeIndex',
                hasCodeIndex,
                'codeInterval * (expectedCodeIndex + 1)',
                state.game.codeInterval * (expectedCodeIndex + 1),
                'lastCode',
                lastCode
              );

              if (!hasCodeIndex && elapsedTime >= state.game.codeInterval) {
                if (lastCode === undefined) {
                  code = 0;
                  member.codeLog.push({ timestamp: currentTime, codeIndex: 0 });
                  result = TagUseResult.CODE;
                } else if (lastCode < expectedCodeIndex) {
                  code = lastCode + 1;
                  member.codeLog.push({ timestamp: currentTime, codeIndex: code });
                  result = TagUseResult.CODE;
                } else {
                  result = TagUseResult.MARK;
                }
              } else {
                result = TagUseResult.MARK;
              }
              member.lastTag[tag] = currentTime;
            } else {
              console.log('Blocked', currentTime - member.lastTag[tag]);
              result = TagUseResult.BLOCKED;
            }
          } else {
            result = TagUseResult.ERROR_MEMBER_NOT_FOUND; // Set result when member not found
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
        console.log('startGame', blockTime, codeInterval);
        if (codeInterval && blockTime) {
          console.log('startGame running', blockTime, codeInterval);
          state.game = {
            startTime: Date.now(), // Record the start time
            currentTime: Date.now(), // Initialize currentTime with startTime
            blockTime,
            codeInterval,
            isRunning: true,
          };
        }
      }),

    pauseGame: () =>
      set((state) => {
        state.game.isRunning = false;
      }),

    resetGame: () =>
      set((state) => {
        state.game = {
          startTime: Date.now(), // Record the start time
          currentTime: Date.now(), // Initialize currentTime with startTime
          blockTime: 0,
          codeInterval: 1000 * 60 * 5,
          isRunning: false,
        };
      }),

    setBlockBoxSetting: (boxId, blockDuration, permanentBlock) =>
      set((state) => {
        console.log('setBlockBoxSetting', boxId, blockDuration, permanentBlock);
        const boxSetting = state.boxSettings[boxId];
        if (boxSetting) {
          if (permanentBlock) {
            boxSetting.permanentBlock = true;
          } else if (blockDuration) {
            boxSetting.blockDuration = blockDuration * 1000;
            boxSetting.blockDurationInput = blockDuration;
            boxSetting.permanentBlock = false;
          } else {
            boxSetting.blockStart = undefined;
            boxSetting.blockDuration = undefined;
            boxSetting.blockEnd = undefined;
            boxSetting.blockDurationInput = undefined;
            boxSetting.permanentBlock = false;
            console.log('blockBox error', boxId, blockDuration, permanentBlock);
          }
        }
      }),

    blockBox: (boxId) =>
      set((state) => {
        const boxSetting = state.boxSettings[boxId];
        console.log('blockBox', boxId, boxSetting);
        if (boxSetting) {
          if (boxSetting.permanentBlock) {
            boxSetting.isBlocked = true;
          } else if (boxSetting.blockDuration) {
            boxSetting.blockStart = Date.now();
            boxSetting.blockEnd = boxSetting.blockStart + (boxSetting.blockDuration ?? 0);
            boxSetting.isBlocked = true;
          } else {
            boxSetting.blockStart = undefined;
            boxSetting.blockDuration = undefined;
            boxSetting.blockEnd = undefined;
            boxSetting.blockDurationInput = undefined;
            boxSetting.permanentBlock = false;
            console.log('blockBox error', boxId, boxSetting);
          }
        }
      }),

    blockUser: (tag) =>
      set((state) => {
        const userSetting = findMemberWithTag(state, tag);

        console.log('blockUser', tag, userSetting);
        if (userSetting) {
          userSetting.blockSetting.isBlocked = true;
        } else {
          console.log('blockUser error', tag, userSetting);
        }
      }),

    unBlockUser: (tag) =>
      set((state) => {
        const userSetting = findMemberWithTag(state, tag);

        console.log('unBlockUser', tag, userSetting);
        if (userSetting) {
          userSetting.blockSetting.isBlocked = false;
          userSetting.blockSetting.blockStart = undefined;
          userSetting.blockSetting.blockDuration = undefined;
          userSetting.blockSetting.blockEnd = undefined;
          userSetting.blockSetting.blockDurationInput = undefined;
          userSetting.blockSetting.permanentBlock = false;
        } else {
          console.log('unBlockUser error', tag, userSetting);
        }
      }),

    setBlockUserSetting: (tag, blockDuration, permanentBlock) =>
      set((state) => {
        const userSetting = findMemberWithTag(state, tag);

        console.log('setBlockUserSetting', tag, userSetting);
        if (userSetting) {
          if (permanentBlock) {
            userSetting.blockSetting.permanentBlock = true;
          } else if (blockDuration) {
            userSetting.blockSetting.blockDuration = blockDuration * 1000;
            userSetting.blockSetting.blockDurationInput = blockDuration;
            userSetting.blockSetting.permanentBlock = false;
          } else {
            userSetting.blockSetting.blockStart = undefined;
            userSetting.blockSetting.blockDuration = undefined;
            userSetting.blockSetting.blockEnd = undefined;
            userSetting.blockSetting.blockDurationInput = undefined;
            userSetting.blockSetting.permanentBlock = false;
            console.log('blockUser error', tag, userSetting);
          }
        }
      }),

    updateUserBlockTimers: () =>
      set((state) => {
        for (const team of state.teams) {
          for (const member of team.members) {
            const userSetting = member.blockSetting;

            if (userSetting.isBlocked) {
              if (userSetting.blockDuration && userSetting.blockStart) {
                userSetting.remainingTime = userSetting.blockDuration - (Date.now() - userSetting.blockStart);
                if (userSetting.remainingTime <= 0) {
                  userSetting.isBlocked = false;
                  userSetting.blockStart = undefined;
                  userSetting.blockDuration = undefined;
                  userSetting.blockEnd = undefined;
                  userSetting.blockDurationInput = undefined;
                  userSetting.permanentBlock = false;
                }
              } else {
                userSetting.remainingTime = undefined;
              }
            } else {
              userSetting.remainingTime = undefined;
            }
          }
        }
      }),

    unBlockBox: (boxId) =>
      set((state) => {
        const boxSetting = state.boxSettings[boxId];
        console.log('unBlockBox', boxId, boxSetting);
        if (boxSetting) {
          boxSetting.isBlocked = false;
          boxSetting.blockStart = undefined;
          boxSetting.blockDuration = undefined;
          boxSetting.blockEnd = undefined;
          boxSetting.blockDurationInput = undefined;
          boxSetting.permanentBlock = false;
        }
      }),

    updateBoxBlockTimers: () =>
      set((state) => {
        for (const box of Object.values(state.boxSettings)) {
          const boxSetting = state.boxSettings[box.entityId];

          if (boxSetting.isBlocked) {
            if (boxSetting.blockDuration && boxSetting.blockStart) {
              boxSetting.remainingTime = boxSetting.blockDuration - (Date.now() - boxSetting.blockStart);
              if (boxSetting.remainingTime <= 0) {
                boxSetting.isBlocked = false;
                boxSetting.blockStart = undefined;
                boxSetting.blockDuration = undefined;
                boxSetting.blockEnd = undefined;
                boxSetting.blockDurationInput = undefined;
                boxSetting.permanentBlock = false;
              }
            } else {
              boxSetting.remainingTime = undefined;
            }
          } else {
            boxSetting.remainingTime = undefined;
          }
        }
      }),
  }))
);
