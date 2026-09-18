import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from '../storage/storage';
import {
  Task,
  DailyBattle,
  DayTaskState,
  getRivalXPOnTask,
  getPlayerXPOnCompletion,
  isDoneBefore6PM,
  applyCleanDayBonus,
  getDayResult,
  updateRivalLevel,
  getEvolutionForm,
  BLEED_WINDOW_MINUTES,
} from '../engine/xpEngine';

// Pre-built task presets
export const PRESET_TASKS = [
  { name: "Study session",      category: "study",    baseXP: 400, duration: "50 min",  checkoffType: "single"  },
  { name: "Gym workout",        category: "physical", baseXP: 350, duration: "1 hr",    checkoffType: "single"  },
  { name: "Morning run",        category: "physical", baseXP: 280, duration: "30 min",  checkoffType: "single"  },
  { name: "Drink 8 glasses",    category: "health",   baseXP: 200, duration: "all day", checkoffType: "counter", counterTarget: 8 },
  { name: "Read 30 minutes",    category: "study",    baseXP: 250, duration: "30 min",  checkoffType: "single"  },
  { name: "Meditate",           category: "mindset",  baseXP: 150, duration: "10 min",  checkoffType: "single"  },
  { name: "Journal",            category: "mindset",  baseXP: 120, duration: "15 min",  checkoffType: "single"  },
  { name: "Deep work block",    category: "work",     baseXP: 450, duration: "2 hr",    checkoffType: "single"  },
  { name: "No social media",    category: "mindset",  baseXP: 300, duration: "all day", checkoffType: "single"  },
  { name: "Cold shower",        category: "physical", baseXP: 100, duration: "5 min",   checkoffType: "single"  },
  { name: "Stretch / mobility", category: "physical", baseXP: 150, duration: "20 min",  checkoffType: "single"  },
  { name: "Cook healthy meal",  category: "health",   baseXP: 180, duration: "45 min",  checkoffType: "single"  },
];

export interface RivalState {
  name: string;
  spriteId: 'warrior' | 'scholar' | 'shadow' | 'phantom' | 'glitch' | 'clone';
  personality: 'ruthless' | 'silent' | 'mentor' | 'chaotic';
  tauntFrequency: 'aggressive' | 'balanced' | 'minimal';
  level: number;
  evolutionForm: 0 | 1 | 2;
  totalXP: number;
}

export interface UserState {
  uid: string | null;
  displayName: string;
  playerLevel: number;
  totalWins: number;
  totalLosses: number;
  currentStreak: number; // Consecutive clean days
  hotStreakActive: boolean; // 3+ clean days in a row
  onboarded: boolean;
}

export interface TauntMessage {
  message: string;
  sentAt: number;
  type: string;
}

export interface TauntState {
  lastTauntAt: number;
  todayTauntCount: number;
  taunts: TauntMessage[];
}

export interface BattleHistoryItem {
  date: string;
  playerXP: number;
  rivalXP: number;
  result: 'player' | 'rival';
  cleanDay: boolean;
}

export interface AppState {
  user: UserState;
  rival: RivalState;
  tasks: Task[];
  dailyBattle: DailyBattle | null;
  tauntsState: TauntState;
  battleHistory: BattleHistoryItem[];
  isMockMode: boolean;
  
  // Actions
  login: (uid: string, displayName: string) => void;
  logout: () => void;
  setOnboarded: (onboarded: boolean) => void;
  updateRival: (fields: Partial<RivalState>) => void;
  
  // Task CRUD
  addTask: (task: Omit<Task, 'id' | 'order' | 'isActive'>) => void;
  updateTask: (id: string, fields: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (orderedTasks: Task[]) => void;
  
  // Daily Battle Actions
  startNewDay: (dateStr: string) => void;
  checkoffTask: (id: string) => void;
  incrementCounter: (id: string) => void;
  recalculateRivalXP: () => void;
  endDay: () => { result: 'player' | 'rival'; levelChanged: string; details: string };
  addTaunt: (message: string, type: string) => void;
  
  // Reset for testing
  resetAllData: () => void;
  simulateBleedForTesting: (hoursElapsed: number) => void;
}

// Utility to format date YYYY-MM-DD
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMidnightTimestamp(dateStr?: string): number {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    return storage.getString(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.delete(name);
  },
};

const initialUser: UserState = {
  uid: null,
  displayName: "Player",
  playerLevel: 0,
  totalWins: 0,
  totalLosses: 0,
  currentStreak: 0,
  hotStreakActive: false,
  onboarded: false,
};

const initialRival: RivalState = {
  name: "SHADOW",
  spriteId: "warrior",
  personality: "ruthless",
  tauntFrequency: "balanced",
  level: 1,
  evolutionForm: 0,
  totalXP: 0,
};

const initialTauntsState: TauntState = {
  lastTauntAt: 0,
  todayTauntCount: 0,
  taunts: [
    { message: "Your rival is already training. Your move.", sentAt: Date.now(), type: "intro" }
  ],
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: initialUser,
      rival: initialRival,
      tasks: [],
      dailyBattle: null,
      tauntsState: initialTauntsState,
      battleHistory: [],
      isMockMode: true,

      login: (uid, displayName) => set((state) => ({
        user: { ...state.user, uid, displayName }
      })),

      logout: () => set({ user: initialUser }),

      setOnboarded: (onboarded) => set((state) => ({
        user: { ...state.user, onboarded }
      })),

      updateRival: (fields) => set((state) => {
        const nextLevel = fields.level !== undefined ? fields.level : state.rival.level;
        return {
          rival: {
            ...state.rival,
            ...fields,
            evolutionForm: getEvolutionForm(nextLevel)
          }
        };
      }),

      addTask: (taskFields) => set((state) => {
        const id = Math.random().toString(36).substring(7);
        const order = state.tasks.length;
        const newTask: Task = {
          ...taskFields,
          id,
          order,
          isActive: true,
          counterCurrent: taskFields.checkoffType === 'counter' ? 0 : undefined
        };
        const nextTasks = [...state.tasks, newTask];
        
        // If daily battle is active, add this task to it
        let nextBattle = state.dailyBattle;
        if (nextBattle) {
          nextBattle = {
            ...nextBattle,
            tasks: {
              ...nextBattle.tasks,
              [id]: {
                baseXP: newTask.baseXP,
                completedAt: null,
                playerXPEarned: 0,
                rivalXPAccrued: 0,
              }
            }
          };
        }

        return { tasks: nextTasks, dailyBattle: nextBattle };
      }),

      updateTask: (id, fields) => set((state) => {
        const nextTasks = state.tasks.map(t => t.id === id ? { ...t, ...fields } : t);
        
        // Update task inside current active battle if necessary
        let nextBattle = state.dailyBattle;
        if (nextBattle && nextBattle.tasks[id]) {
          const currentTaskState = nextBattle.tasks[id];
          const newBaseXP = fields.baseXP !== undefined ? fields.baseXP : currentTaskState.baseXP;
          nextBattle = {
            ...nextBattle,
            tasks: {
              ...nextBattle.tasks,
              [id]: {
                ...currentTaskState,
                baseXP: newBaseXP,
              }
            }
          };
        }

        return { tasks: nextTasks, dailyBattle: nextBattle };
      }),

      deleteTask: (id) => set((state) => {
        const nextTasks = state.tasks.filter(t => t.id !== id);
        
        let nextBattle = state.dailyBattle;
        if (nextBattle && nextBattle.tasks[id]) {
          const updatedBattleTasks = { ...nextBattle.tasks };
          delete updatedBattleTasks[id];
          nextBattle = { ...nextBattle, tasks: updatedBattleTasks };
        }

        return { tasks: nextTasks, dailyBattle: nextBattle };
      }),

      reorderTasks: (orderedTasks) => set(() => ({
        tasks: orderedTasks.map((t, idx) => ({ ...t, order: idx }))
      })),

      startNewDay: (dateStr) => set((state) => {
        const dayStartTime = getMidnightTimestamp(dateStr);
        
        // Build initial states for all active tasks
        const battleTasks: Record<string, DayTaskState> = {};
        state.tasks.forEach(task => {
          if (task.isActive) {
            battleTasks[task.id] = {
              baseXP: task.baseXP,
              completedAt: null,
              playerXPEarned: 0,
              rivalXPAccrued: 0,
            };
          }
        });

        // Reset counters for counter-type tasks
        const resetTasks = state.tasks.map(t => 
          t.checkoffType === 'counter' ? { ...t, counterCurrent: 0 } : t
        );

        const newBattle: DailyBattle = {
          date: dateStr,
          resetTime: dayStartTime + 24 * 60 * 60 * 1000 - 1, // End of this day
          playerTotalXP: 0,
          rivalTotalXP: 0,
          result: 'pending',
          cleanDay: false,
          tasks: battleTasks,
        };

        // Reset today's taunt count
        const nextTauntsState = {
          ...state.tauntsState,
          todayTauntCount: 0
        };

        return { 
          dailyBattle: newBattle, 
          tasks: resetTasks,
          tauntsState: nextTauntsState
        };
      }),

      checkoffTask: (id) => set((state) => {
        if (!state.dailyBattle) return {};

        const dayStartTime = getMidnightTimestamp(state.dailyBattle.date);
        const now = Date.now();
        const taskConfig = state.tasks.find(t => t.id === id);
        if (!taskConfig) return {};

        const currentBattleTasks = { ...state.dailyBattle.tasks };
        const currentTask = currentBattleTasks[id];
        
        if (currentTask && currentTask.completedAt === null) {
          // Calculate final rival accrued XP at the instant of completion
          const rivalXP = getRivalXPOnTask(
            currentTask.baseXP,
            dayStartTime,
            now,
            state.user.hotStreakActive
          );

          currentBattleTasks[id] = {
            ...currentTask,
            completedAt: now,
            playerXPEarned: getPlayerXPOnCompletion(currentTask.baseXP),
            rivalXPAccrued: rivalXP,
          };
        }

        // Recalculate totals
        let totalPlayerXP = 0;
        let totalRivalXP = 0;
        let allCompleted = true;
        let allCompletedBefore6PM = true;

        Object.keys(currentBattleTasks).forEach(key => {
          const t = currentBattleTasks[key];
          totalPlayerXP += t.playerXPEarned;
          totalRivalXP += t.rivalXPAccrued;

          if (t.completedAt === null) {
            allCompleted = false;
          } else {
            // Check if completed before 6PM (18 hours elapsed)
            const minutesElapsed = (t.completedAt - dayStartTime) / 1000 / 60;
            if (minutesElapsed >= 1080) {
              allCompletedBefore6PM = false;
            }
          }
        });

        const isCleanDay = allCompleted && allCompletedBefore6PM;
        const finalPlayerXP = applyCleanDayBonus(totalPlayerXP, isCleanDay);

        // Update task count if counter-type to fully match target
        const nextTasks = state.tasks.map(t => 
          t.id === id && t.checkoffType === 'counter' 
            ? { ...t, counterCurrent: t.counterTarget } 
            : t
        );

        return {
          tasks: nextTasks,
          dailyBattle: {
            ...state.dailyBattle,
            tasks: currentBattleTasks,
            playerTotalXP: finalPlayerXP,
            rivalTotalXP: totalRivalXP,
            cleanDay: isCleanDay,
          }
        };
      }),

      incrementCounter: (id) => set((state) => {
        if (!state.dailyBattle) return {};

        const nextTasks = state.tasks.map(t => {
          if (t.id === id && t.checkoffType === 'counter') {
            const current = (t.counterCurrent || 0) + 1;
            return { ...t, counterCurrent: Math.min(current, t.counterTarget || 1) };
          }
          return t;
        });

        const updatedTask = nextTasks.find(t => t.id === id);
        if (updatedTask && updatedTask.counterCurrent === updatedTask.counterTarget) {
          // If targets met, trigger full task checkoff!
          setTimeout(() => get().checkoffTask(id), 50);
        }

        return { tasks: nextTasks };
      }),

      recalculateRivalXP: () => set((state) => {
        if (!state.dailyBattle) return {};

        const dayStartTime = getMidnightTimestamp(state.dailyBattle.date);
        const now = Date.now();
        const updatedBattleTasks = { ...state.dailyBattle.tasks };

        let totalPlayerXP = 0;
        let totalRivalXP = 0;
        let allCompleted = true;
        let allCompletedBefore6PM = true;

        Object.keys(updatedBattleTasks).forEach(key => {
          const t = updatedBattleTasks[key];
          
          if (t.completedAt === null) {
            // Task still bleeding, calculate active accrued XP
            t.rivalXPAccrued = getRivalXPOnTask(
              t.baseXP,
              dayStartTime,
              null,
              state.user.hotStreakActive
            );
            allCompleted = false;
          } else {
            // Task is completed, use locked bleed
            const minutesElapsed = (t.completedAt - dayStartTime) / 1000 / 60;
            if (minutesElapsed >= 1080) {
              allCompletedBefore6PM = false;
            }
          }

          totalPlayerXP += t.playerXPEarned;
          totalRivalXP += t.rivalXPAccrued;
        });

        const isCleanDay = allCompleted && allCompletedBefore6PM;
        const finalPlayerXP = applyCleanDayBonus(totalPlayerXP, isCleanDay);

        return {
          dailyBattle: {
            ...state.dailyBattle,
            tasks: updatedBattleTasks,
            playerTotalXP: finalPlayerXP,
            rivalTotalXP: totalRivalXP,
            cleanDay: isCleanDay,
          }
        };
      }),

      endDay: () => {
        const state = get();
        if (!state.dailyBattle) return { result: 'rival', levelChanged: '', details: 'No active battle' };

        // Force final recalculation
        state.recalculateRivalXP();
        const refreshedBattle = get().dailyBattle!;

        const result = getDayResult(refreshedBattle.playerTotalXP, refreshedBattle.rivalTotalXP);
        const currentRivalLevel = state.rival.level;
        const nextRivalLevel = updateRivalLevel(currentRivalLevel, result);
        
        // Streak calculation:
        // Clean day means all active tasks completed before 6PM.
        // If cleanDay is true, increment streak.
        // Hot streak is active if currentStreak >= 3.
        const cleanDay = refreshedBattle.cleanDay;
        const nextStreak = cleanDay ? state.user.currentStreak + 1 : 0;
        const hotStreakActive = nextStreak >= 3;

        const totalWins = result === 'player' ? state.user.totalWins + 1 : state.user.totalWins;
        const totalLosses = result === 'rival' ? state.user.totalLosses + 1 : state.user.totalLosses;
        
        // Cumulative wins / 5 = player level (min 1)
        const playerLevel = Math.max(1, Math.floor(totalWins / 5));

        const levelChangeText = result === 'player'
          ? `${state.rival.name}: Lv.${currentRivalLevel} → Lv.${nextRivalLevel}`
          : `${state.rival.name}: Lv.${currentRivalLevel} → Lv.${nextRivalLevel}`;

        // Save history item
        const historyItem: BattleHistoryItem = {
          date: refreshedBattle.date,
          playerXP: refreshedBattle.playerTotalXP,
          rivalXP: refreshedBattle.rivalTotalXP,
          result,
          cleanDay,
        };

        const updatedHistory = [historyItem, ...state.battleHistory].slice(0, 30);

        set((state) => ({
          user: {
            ...state.user,
            totalWins,
            totalLosses,
            currentStreak: nextStreak,
            hotStreakActive,
            playerLevel,
          },
          rival: {
            ...state.rival,
            level: nextRivalLevel,
            totalXP: state.rival.totalXP + refreshedBattle.rivalTotalXP,
            evolutionForm: getEvolutionForm(nextRivalLevel),
          },
          dailyBattle: {
            ...refreshedBattle,
            result,
          },
          battleHistory: updatedHistory,
        }));

        return {
          result,
          levelChanged: levelChangeText,
          details: result === 'player'
            ? `You won today! Beat ${state.rival.name} by ${Math.round(refreshedBattle.playerTotalXP - refreshedBattle.rivalTotalXP)} XP.`
            : `Rival won today. Lost by ${Math.round(refreshedBattle.rivalTotalXP - refreshedBattle.playerTotalXP)} XP.`
        };
      },

      addTaunt: (message, type) => set((state) => {
        const newTaunt: TauntMessage = {
          message,
          sentAt: Date.now(),
          type,
        };
        return {
          tauntsState: {
            lastTauntAt: Date.now(),
            todayTauntCount: state.tauntsState.todayTauntCount + 1,
            taunts: [newTaunt, ...state.tauntsState.taunts].slice(0, 50)
          }
        };
      }),

      resetAllData: () => set(() => ({
        user: initialUser,
        rival: initialRival,
        tasks: [],
        dailyBattle: null,
        tauntsState: initialTauntsState,
        battleHistory: [],
      })),

      // Test utility to advance time to simulate bleed
      simulateBleedForTesting: (hoursElapsed) => set((state) => {
        if (!state.dailyBattle) return {};
        
        // Rewind the dayStart timestamp to simulate that hours have passed
        const fakeDayStart = getMidnightTimestamp(state.dailyBattle.date) - (hoursElapsed * 60 * 60 * 1000);
        
        // We temporarily update dailyBattle startTime inside recalculate calculations
        const updatedBattleTasks = { ...state.dailyBattle.tasks };
        let totalPlayerXP = 0;
        let totalRivalXP = 0;

        Object.keys(updatedBattleTasks).forEach(key => {
          const t = updatedBattleTasks[key];
          
          if (t.completedAt === null) {
            // Task incomplete: calculate bleed based on fake offset start
            const mockNow = Date.now();
            const minutesElapsed = (mockNow - fakeDayStart) / 1000 / 60;
            const bleedRate = t.baseXP / BLEED_WINDOW_MINUTES;
            const multiplier = state.user.hotStreakActive ? 0.5 : 1.0;
            const rawAccrued = bleedRate * minutesElapsed * multiplier;
            t.rivalXPAccrued = Math.max(0, Math.min(rawAccrued, t.baseXP));
          }
          
          totalPlayerXP += t.playerXPEarned;
          totalRivalXP += t.rivalXPAccrued;
        });

        return {
          dailyBattle: {
            ...state.dailyBattle,
            tasks: updatedBattleTasks,
            playerTotalXP: totalPlayerXP,
            rivalTotalXP: totalRivalXP,
          }
        };
      }),
    }),
    {
      name: 'alter-app-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
