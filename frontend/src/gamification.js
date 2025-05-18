/**
 * @file gamification.js
 * Manages player XP, levels, and potentially badges.
 */

const XP_KEY = 'czesciZdaniaXP';
const LEVEL_KEY = 'czesciZdaniaLevel';
const XP_PER_LEVEL = 100;

/**
 * Retrieves current XP from localStorage.
 * @returns {number} Current XP.
 */
export function getXP() {
    const xp = localStorage.getItem(XP_KEY);
    return xp ? parseInt(xp, 10) : 0;
}

/**
 * Saves XP to localStorage.
 * @param {number} xp - The XP to save.
 */
function saveXP(xp) {
    localStorage.setItem(XP_KEY, xp.toString());
}

/**
 * Retrieves current level from localStorage.
 * @returns {number} Current level.
 */
export function getLevel() {
    const level = localStorage.getItem(LEVEL_KEY);
    return level ? parseInt(level, 10) : 1; // Start at level 1
}

/**
 * Saves level to localStorage.
 * @param {number} level - The level to save.
 */
function saveLevel(level) {
    localStorage.setItem(LEVEL_KEY, level.toString());
}

/**
 * Adds XP points and handles level-ups.
 * @param {number} points - Points to add (can be negative).
 * @returns {{xp: number, level: number, leveledUp: boolean, oldLevel: number}} 
 *          Object with current XP, current level, and whether a level-up occurred.
 */
export function addXP(points) {
    let currentXP = getXP();
    let currentLevel = getLevel();
    const oldLevel = currentLevel;

    currentXP += points;
    if (currentXP < 0) {
        currentXP = 0; // XP shouldn't go below 0
    }

    // Check for level up/down (though typically only up)
    // Math.floor handles cases where multiple levels might be gained at once.
    const newCalculatedLevel = Math.floor(currentXP / XP_PER_LEVEL) + 1;
    
    let leveledUp = false;
    if (newCalculatedLevel > currentLevel) {
        currentLevel = newCalculatedLevel;
        leveledUp = true;
    } else if (newCalculatedLevel < currentLevel && currentXP >= 0) {
        // Handle potential level down if XP massively decreases, though less common.
        // Ensure level doesn't go below 1.
        currentLevel = Math.max(1, newCalculatedLevel);
    }
    // If currentLevel is still 0 due to 0 XP, ensure it's 1.
    if (currentLevel === 0 && currentXP === 0) currentLevel = 1;


    saveXP(currentXP);
    saveLevel(currentLevel);

    return {
        xp: currentXP,
        level: currentLevel,
        leveledUp: leveledUp,
        oldLevel: oldLevel
    };
}

/**
 * Gets the XP needed for the next level.
 * @returns {number}
 */
export function getXPForNextLevel() {
    const currentLevel = getLevel();
    return currentLevel * XP_PER_LEVEL;
}

/**
 * Gets the current progress towards the next level as a percentage.
 * @returns {number} Percentage (0-100).
 */
export function getLevelProgressPercentage() {
    const currentXP = getXP();
    const currentLevel = getLevel();
    
    const xpInCurrentLevel = currentXP - ((currentLevel - 1) * XP_PER_LEVEL);
    if (XP_PER_LEVEL === 0) return 0; // Avoid division by zero
    const progress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
    return Math.max(0, Math.min(100, progress)); // Clamp between 0 and 100
}

/**
 * Resets player's XP and Level to initial state.
 */
export function resetGamification() {
    saveXP(0);
    saveLevel(1);
    console.log("Gamification data (XP and Level) has been reset.");
}

// --- Basic Test Area ---
export function testGamification() {
    console.log("--- Test Gamification --- (Check localStorage)");
    localStorage.removeItem(XP_KEY);
    localStorage.removeItem(LEVEL_KEY);

    console.log("Initial state:", getXP(), "XP, Level", getLevel());

    let result = addXP(50);
    console.log("Added 50 XP:", result);
    console.assert(result.xp === 50 && result.level === 1 && !result.leveledUp, "Test 1 Failed");

    result = addXP(60); // Should level up (50 + 60 = 110 XP)
    console.log("Added 60 XP:", result);
    console.assert(result.xp === 110 && result.level === 2 && result.leveledUp, "Test 2 Failed: Level up");
    console.assert(result.oldLevel === 1, "Test 2 Failed: Old level mismatch");

    result = addXP(195); // Should level up twice (110 + 195 = 305 XP -> Level 4)
    console.log("Added 195 XP:", result);
    console.assert(result.xp === 305 && result.level === 4 && result.leveledUp, "Test 3 Failed: Multi-level up");
    console.assert(result.oldLevel === 2, "Test 3 Failed: Old level mismatch for multi-level");

    result = addXP(-200); // Lose XP, should go to level 2 (305 - 200 = 105 XP)
    console.log("Lost 200 XP:", result);
    console.assert(result.xp === 105 && result.level === 2 && !result.leveledUp, "Test 4 Failed: Lose XP, level down");

    result = addXP(-200); // Lose more XP, should go to 0 XP, level 1
    console.log("Lost 200 XP again:", result);
    console.assert(result.xp === 0 && result.level === 1 && !result.leveledUp, "Test 5 Failed: XP to 0, level 1");
    
    console.log("Progress to next level:", getLevelProgressPercentage() + "%");
    console.log("XP for next level (Level 2):", getXPForNextLevel()); // 1 * 100 = 100

    addXP(100); // Reach exactly level 2
    console.log("XP for next level (Level 3):", getXPForNextLevel()); // 2 * 100 = 200
    console.log("Current level progress for level 2: " + getLevelProgressPercentage() + "%"); // Should be 0%

    resetGamification();
    console.log("After reset:", getXP(), "XP, Level", getLevel());
    console.assert(getXP() === 0 && getLevel() === 1, "Test Reset Failed");

    console.log("Gamification test function finished.");
}

// To test:
// import { testGamification, addXP, getXP, getLevel } from './gamification.js';
// testGamification();
// console.log(getXP(), getLevel());
// addXP(10);
// console.log(getXP(), getLevel()); 