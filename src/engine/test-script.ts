// @ts-nocheck
import {
  calculateCurrentRivalBleed,
  getRivalXPOnTask,
  applyCleanDayBonus,
  getRivalBleedMultiplier,
  getDayResult,
  updateRivalLevel,
  getEvolutionForm
} from './xpEngine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
  console.log(`✅ TEST PASSED: ${message}`);
}

console.log("Starting XP Engine Test Suite...\n");

// Test 1: Linear Bleed Rate Calculations
// Midnight is dayStartTime. 4 hours later is 240 minutes.
// BaseXP = 400. Bleed window = 960 minutes.
// Bleed rate = 400 / 960 = 0.4166 XP per minute.
// Accrued after 240 minutes = 0.4166 * 240 = 100 XP.
const dayStart = Date.now() - (240 * 60 * 1000); // 4 hours ago
const normalBleed = calculateCurrentRivalBleed(400, dayStart, Date.now(), false);
assert(Math.round(normalBleed) === 100, `4 hours of elapsed bleed on 400XP task should be 100XP (got ${normalBleed})`);

// Test 2: Hot Streak Bleed Halving
const streakBleed = calculateCurrentRivalBleed(400, dayStart, Date.now(), true);
assert(Math.round(streakBleed) === 50, `4 hours of elapsed bleed on Hot Streak (halved) should be 50XP (got ${streakBleed})`);

// Test 3: Capping at Base XP after 16 hours
const sixteenHoursAgo = Date.now() - (1000 * 60 * 60 * 1000); // 1000 minutes ago (more than 960 cutoff)
const cappedBleed = calculateCurrentRivalBleed(400, sixteenHoursAgo, Date.now(), false);
assert(cappedBleed === 400, `Capped bleed after 16+ hours should equal base XP of 400 (got ${cappedBleed})`);

// Test 4: Clean Day Bonus (1.25x boost)
const playerXPWithoutBonus = 1000;
const normalXP = applyCleanDayBonus(playerXPWithoutBonus, false);
const cleanDayXP = applyCleanDayBonus(playerXPWithoutBonus, true);
assert(normalXP === 1000, "XP should remain unchanged if Clean Day is inactive");
assert(cleanDayXP === 1250, "XP should have a 1.25x (25% boost) multiplier if Clean Day is active");

// Test 5: Day Winner Determination
assert(getDayResult(800, 750) === 'player', "Player wins when player XP >= rival XP");
assert(getDayResult(600, 800) === 'rival', "Rival wins when player XP < rival XP");

// Test 6: Level Adjustments
assert(updateRivalLevel(14, 'rival') === 15, "Rival level increases by 1 on loss");
assert(updateRivalLevel(14, 'player') === 13, "Rival level decreases by 1 on win");
assert(updateRivalLevel(50, 'rival') === 50, "Rival level caps at 50 on loss");
assert(updateRivalLevel(1, 'player') === 1, "Rival level bottoms at 1 on win");

// Test 7: Evolution Form Identification
assert(getEvolutionForm(45) === 1, "Level 45 should yield powered form (1)");
assert(getEvolutionForm(14) === 0, "Level 14 should yield base form (0)");
assert(getEvolutionForm(2) === 2, "Level 2 should yield degraded form (2)");

console.log("\nAll core XP engine tests executed successfully!");
