/**
 * @file gamification.js
 * Manages player XP, levels, and potentially badges.
 */

const XP_KEY = 'czesciZdaniaXP';
const LEVEL_KEY = 'czesciZdaniaLevel';
const XP_PER_LEVEL = 100;

// --- Badge Definitions and Storage ---
export const BADGES = {
    SUBJECT_MASTER: {
        id: 'SUBJECT_MASTER',
        name: 'Mistrz Podmiotu',
        description: 'Poprawnie oznacz 10 podmiotów z rzędu.',
        icon: 'fas fa-crown', // Example Font Awesome icon class
        criteria: { type: 'consecutiveCorrect', partOfSpeech: 'podmiot', count: 10 }
    },
    // Example of another badge type
    // PERFECT_STREAK_3: {
    //     id: 'PERFECT_STREAK_3',
    //     name: 'Perfekcyjna Seria (3)',
    //     description: 'Rozwiąż 3 zdania z rzędu bezbłędnie.',
    //     icon: 'fas fa-star',
    //     criteria: { type: 'perfectSentencesStreak', count: 3 }
    // }
};

const EARNED_BADGES_KEY = 'czesciZdaniaEarnedBadges';
const BADGE_PROGRESS_KEY_PREFIX = 'czesciZdaniaBadgeProgress_';

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
 * Retrieves earned badges from localStorage.
 * @returns {Object} An object where keys are badge IDs and values are earning timestamps.
 */
export function getEarnedBadges() {
    const badges = localStorage.getItem(EARNED_BADGES_KEY);
    return badges ? JSON.parse(badges) : {};
}

/**
 * Saves earned badges to localStorage.
 * @param {Object} earnedBadges - The earned badges object to save.
 */
function saveEarnedBadges(earnedBadges) {
    localStorage.setItem(EARNED_BADGES_KEY, JSON.stringify(earnedBadges));
}

/**
 * Awards a badge if not already earned.
 * @param {string} badgeId - The ID of the badge to award.
 * @returns {boolean} True if the badge was newly awarded, false otherwise.
 */
function awardBadge(badgeId) {
    const earnedBadges = getEarnedBadges();
    if (!earnedBadges[badgeId]) {
        earnedBadges[badgeId] = new Date().toISOString();
        saveEarnedBadges(earnedBadges);
        console.log(`Badge awarded: ${BADGES[badgeId]?.name || badgeId}!`);
        // Here you could trigger a UI notification
        return true;
    }
    return false;
}

/**
 * Gets progress for a specific badge criterion.
 * @param {string} criterionKey - Unique key for the progress (e.g., 'consecutiveSubjectCorrect')
 * @returns {any} The stored progress value, or a default (e.g., 0).
 */
function getBadgeProgress(criterionKey) {
    const item = localStorage.getItem(`${BADGE_PROGRESS_KEY_PREFIX}${criterionKey}`);
    return item ? JSON.parse(item) : 0; // Default to 0 for counts
}

/**
 * Saves progress for a specific badge criterion.
 * @param {string} criterionKey - Unique key for the progress.
 * @param {any} value - The value to save.
 */
function saveBadgeProgress(criterionKey, value) {
    localStorage.setItem(`${BADGE_PROGRESS_KEY_PREFIX}${criterionKey}`, JSON.stringify(value));
}

/**
 * Resets player's XP and Level to initial state.
 */
export function resetGamification() {
    saveXP(0);
    saveLevel(1);
    // Reset badges and progress
    saveEarnedBadges({});
    // Clear all badge progress - be more specific if some progress should persist differently
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(BADGE_PROGRESS_KEY_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
    console.log("Gamification data (XP, Level, Badges, Badge Progress) has been reset.");
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

// --- Badge Checking Logic ---

/**
 * Checks and awards badges based on game events and evaluation results.
 * This function will be called after sentence evaluation.
 * @param {Object} evaluationDetails - Detailed results from sentence evaluation.
 *                                    Example: {
 *                                       isPerfectSentence: boolean,
 *                                       partsOfSpeechFeedback: [ { word: string, attempted: string, actual: string, isCorrect: boolean, partOfSpeech: string } ],
 *                                       timeTakenSeconds: number (optional)
 *                                    }
 */
export function checkAndAwardBadges(evaluationDetails) {
    if (!evaluationDetails) return;

    const earnedBadges = getEarnedBadges();

    // --- Check for SUBJECT_MASTER badge ---
    const subjectMasterBadge = BADGES.SUBJECT_MASTER;
    if (subjectMasterBadge && !earnedBadges[subjectMasterBadge.id]) {
        let consecutiveCorrectSubjects = getBadgeProgress('consecutive_podmiot_correct');
        
        let subjectAttemptedInThisRound = false;
        let subjectCorrectInThisRound = true; // Assume correct unless proven otherwise or not attempted

        if (evaluationDetails.partsOfSpeechFeedback) {
            evaluationDetails.partsOfSpeechFeedback.forEach(feedback => {
                if (feedback.partOfSpeech === subjectMasterBadge.criteria.partOfSpeech) { // 'podmiot'
                    subjectAttemptedInThisRound = true;
                    if (feedback.isCorrect) {
                        // This specific 'podmiot' was correct
                    } else {
                        subjectCorrectInThisRound = false; // Any incorrect 'podmiot' in the sentence breaks the streak for this round
                    }
                }
            });
        }
        
        if (subjectAttemptedInThisRound && subjectCorrectInThisRound) {
            consecutiveCorrectSubjects++;
        } else if (subjectAttemptedInThisRound && !subjectCorrectInThisRound) {
            // If a subject was attempted and was incorrect, reset streak
            consecutiveCorrectSubjects = 0;
        }
        // If no subject was attempted in this round, the streak neither increments nor resets. It holds.
        // Or, one might decide that not attempting a subject when present also breaks a "consecutive correct" streak.
        // For now, we only increment on correct, reset on incorrect.

        saveBadgeProgress('consecutive_podmiot_correct', consecutiveCorrectSubjects);

        if (consecutiveCorrectSubjects >= subjectMasterBadge.criteria.count) {
            awardBadge(subjectMasterBadge.id);
        }
    }

    // --- Check for PERFECT_STREAK_3 badge (example) ---
    // const perfectStreakBadge = BADGES.PERFECT_STREAK_3;
    // if (perfectStreakBadge && !earnedBadges[perfectStreakBadge.id] && evaluationDetails.isPerfectSentence !== undefined) {
    //     let perfectSentenceStreak = getBadgeProgress('perfect_sentence_streak');
    //     if (evaluationDetails.isPerfectSentence) {
    //         perfectSentenceStreak++;
    //     } else {
    //         perfectSentenceStreak = 0; // Reset streak on any imperfect sentence
    //     }
    //     saveBadgeProgress('perfect_sentence_streak', perfectSentenceStreak);
    //     if (perfectSentenceStreak >= perfectStreakBadge.criteria.count) {
    //         awardBadge(perfectStreakBadge.id);
    //     }
    // }
    
    // Add checks for other badges here
} 