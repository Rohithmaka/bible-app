export interface Task {
  id: string;
  name: string;
  category: 'study' | 'physical' | 'health' | 'mindset' | 'work' | 'custom';
  baseXP: number;
  checkoffType: 'single' | 'counter';
  counterTarget?: number;
  counterCurrent?: number;
  isActive: boolean;
  order: number;
}

export interface DayTaskState {
  baseXP: number;
  completedAt: number | null; // Milliseconds timestamp
  playerXPEarned: number;
  rivalXPAccrued: number; // Ticks up, then locks on completion
}

export interface DailyBattle {
  date: string; // YYYY-MM-DD
  resetTime: number; // EOD reset timestamp
  playerTotalXP: number;
  rivalTotalXP: number;
  result: 'player' | 'rival' | 'pending';
  cleanDay: boolean; // all tasks done before 6 PM
  tasks: Record<string, DayTaskState>;
}

// Bleed window minutes: 960 (16 hours from local midnight: midnight to 4 PM cutoff)
export const BLEED_WINDOW_MINUTES = 960;

/**
 * Calculates current accrued rival XP on an incomplete task.
 * @param baseXP Base XP of the task
 * @param dayStartTime Midnight timestamp (ms) for the current day
 * @param now Current timestamp (ms)
 * @param hotStreakActive Whether the hot streak is active (halves bleed)
 */
export function calculateCurrentRivalBleed(
  baseXP: number,
  dayStartTime: number,
  now: number,
  hotStreakActive: boolean
): number {
  const minutesElapsed = (now - dayStartTime) / 1000 / 60;
  const bleedRate = baseXP / BLEED_WINDOW_MINUTES;
  const rawAccrued = bleedRate * minutesElapsed;
  
  // Apply hot streak bleed halving if active
  const multiplier = hotStreakActive ? 0.5 : 1.0;
  const accrued = rawAccrued * multiplier;
  
  // Cap at base XP
  return Math.max(0, Math.min(accrued, baseXP));
}

/**
 * Rival XP accrued on a single task at a specific checkoff time or current time.
 */
export function getRivalXPOnTask(
  baseXP: number,
  dayStartTime: number,
  completedAt: number | null,
  hotStreakActive: boolean
): number {
  const cutoffTime = completedAt || Date.now();
  return calculateCurrentRivalBleed(baseXP, dayStartTime, cutoffTime, hotStreakActive);
}

/**
 * Player earns full baseXP instantly on check-off
 */
export function getPlayerXPOnCompletion(baseXP: number): number {
  return baseXP;
}

/**
 * Clean Day bonus — all tasks done before 6PM local time
 * Checks if all tasks in list were completed before 6PM.
 * 6PM is 18 hours (1080 minutes) elapsed from midnight.
 */
export function isDoneBefore6PM(completedAt: number | null, dayStartTime: number): boolean {
  if (!completedAt) return false;
  const minutesElapsed = (completedAt - dayStartTime) / 1000 / 60;
  return minutesElapsed < 1080; // 18 hours * 60 minutes = 1080
}

/**
 * Apply clean day bonus to player XP (25% boost, rounded down)
 */
export function applyCleanDayBonus(playerXP: number, allDoneBy6PM: boolean): number {
  return allDoneBy6PM ? Math.floor(playerXP * 1.25) : playerXP;
}

/**
 * Get rival bleed multiplier based on Hot Streak state
 */
export function getRivalBleedMultiplier(hotStreakActive: boolean): number {
  return hotStreakActive ? 0.5 : 1.0;
}

/**
 * Determine the day's winner based on total XP
 */
export function getDayResult(playerXP: number, rivalXP: number): 'player' | 'rival' {
  return playerXP >= rivalXP ? 'player' : 'rival';
}

/**
 * Update rival level after day result
 */
export function updateRivalLevel(currentLevel: number, result: 'player' | 'rival'): number {
  if (result === 'rival') return Math.min(currentLevel + 1, 50);
  if (result === 'player') return Math.max(currentLevel - 1, 1);
  return currentLevel;
}

/**
 * Get rival visual evolution form
 * 0 = base, 1 = powered-up (Lv 30+), 2 = degraded (Lv <= 3)
 */
export function getEvolutionForm(level: number): 0 | 1 | 2 {
  if (level >= 30) return 1;
  if (level <= 3) return 2;
  return 0;
}
