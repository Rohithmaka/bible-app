"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCurrentRivalBleed = calculateCurrentRivalBleed;
exports.getRivalXPOnTask = getRivalXPOnTask;
exports.getPlayerXPOnCompletion = getPlayerXPOnCompletion;
exports.isDoneBefore6PM = isDoneBefore6PM;
exports.applyCleanDayBonus = applyCleanDayBonus;
exports.getRivalBleedMultiplier = getRivalBleedMultiplier;
exports.getDayResult = getDayResult;
exports.updateRivalLevel = updateRivalLevel;
exports.getEvolutionForm = getEvolutionForm;
// Bleed window minutes: 960 (16 hours from local midnight: midnight to 4 PM cutoff)
const BLEED_WINDOW_MINUTES = 960;
/**
 * Calculates current accrued rival XP on an incomplete task.
 * @param baseXP Base XP of the task
 * @param dayStartTime Midnight timestamp (ms) for the current day
 * @param now Current timestamp (ms)
 * @param hotStreakActive Whether the hot streak is active (halves bleed)
 */
function calculateCurrentRivalBleed(baseXP, dayStartTime, now, hotStreakActive) {
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
function getRivalXPOnTask(baseXP, dayStartTime, completedAt, hotStreakActive) {
    const cutoffTime = completedAt || Date.now();
    return calculateCurrentRivalBleed(baseXP, dayStartTime, cutoffTime, hotStreakActive);
}
/**
 * Player earns full baseXP instantly on check-off
 */
function getPlayerXPOnCompletion(baseXP) {
    return baseXP;
}
/**
 * Clean Day bonus — all tasks done before 6PM local time
 * Checks if all tasks in list were completed before 6PM.
 * 6PM is 18 hours (1080 minutes) elapsed from midnight.
 */
function isDoneBefore6PM(completedAt, dayStartTime) {
    if (!completedAt)
        return false;
    const minutesElapsed = (completedAt - dayStartTime) / 1000 / 60;
    return minutesElapsed < 1080; // 18 hours * 60 minutes = 1080
}
/**
 * Apply clean day bonus to player XP (25% boost, rounded down)
 */
function applyCleanDayBonus(playerXP, allDoneBy6PM) {
    return allDoneBy6PM ? Math.floor(playerXP * 1.25) : playerXP;
}
/**
 * Get rival bleed multiplier based on Hot Streak state
 */
function getRivalBleedMultiplier(hotStreakActive) {
    return hotStreakActive ? 0.5 : 1.0;
}
/**
 * Determine the day's winner based on total XP
 */
function getDayResult(playerXP, rivalXP) {
    return playerXP >= rivalXP ? 'player' : 'rival';
}
/**
 * Update rival level after day result
 */
function updateRivalLevel(currentLevel, result) {
    if (result === 'rival')
        return Math.min(currentLevel + 1, 50);
    if (result === 'player')
        return Math.max(currentLevel - 1, 1);
    return currentLevel;
}
/**
 * Get rival visual evolution form
 * 0 = base, 1 = powered-up (Lv 30+), 2 = degraded (Lv <= 3)
 */
function getEvolutionForm(level) {
    if (level >= 30)
        return 1;
    if (level <= 3)
        return 2;
    return 0;
}
