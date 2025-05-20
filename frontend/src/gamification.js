/**
 * @file gamification.js
 * Manages player XP, levels, and potentially badges.
 */

const XP_KEY = 'podmiotISpolkaXP';
const LEVEL_KEY = 'podmiotISpolkaLevel';
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
    PERFECT_STREAK_3: {
        id: 'PERFECT_STREAK_3',
        name: 'Perfekcyjna Seria (3)',
        description: 'Rozwiąż 3 zdania z rzędu bezbłędnie.',
        icon: 'fas fa-star',
        criteria: { type: 'perfectSentencesStreak', count: 3 }
    },
    PERFECT_STREAK_5: {
        id: 'PERFECT_STREAK_5',
        name: 'Perfekcyjna Seria (5)',
        description: 'Rozwiąż 5 zdań z rzędu bezbłędnie.',
        icon: 'fas fa-medal',
        criteria: { type: 'perfectSentencesStreak', count: 5 }
    },
    QUICK_LEARNER: {
        id: 'QUICK_LEARNER',
        name: 'Szybki Uczeń',
        description: 'Poprawnie rozwiąż swoje pierwsze zdanie.',
        icon: 'fas fa-graduation-cap',
        criteria: { type: 'firstCorrectSentence' }
    },
    VOCAB_VIRTUOSO: {
        id: 'VOCAB_VIRTUOSO',
        name: 'Mistrz Słownictwa',
        description: 'Poprawnie oznacz 20 dowolnych części zdania.',
        icon: 'fas fa-book-open',
        criteria: { type: 'totalCorrectParts', count: 20 }
    },
    GRAMMAR_GURU: {
        id: 'GRAMMAR_GURU',
        name: 'Guru Gramatyki',
        description: 'Osiągnij Poziom 5.',
        icon: 'fas fa-brain',
        criteria: { type: 'reachLevel', level: 5 }
    },
    // Humorous Badges
    CLUMSY_CLICKER: {
        id: 'CLUMSY_CLICKER',
        name: 'Niezdarny Klikacz',
        description: 'Popełnij co najmniej 3 błędy w jednym zdaniu. Zdarza się najlepszym!',
        icon: 'fas fa-hand-sparkles', // More fun than fa-bomb
        criteria: { type: 'mistakesInSentence', count: 3 }
    },
    PARTICIPATION_AWARD: {
        id: 'PARTICIPATION_AWARD',
        name: 'Nagroda za Udział',
        description: 'Ukończono pierwsze zdanie! Każda podróż zaczyna się od pierwszego kroku.',
        icon: 'fas fa-award',
        criteria: { type: 'firstSentenceCompleted' }
    },
    SPEEDY_GUESSER: {
        id: 'SPEEDY_GUESSER',
        name: 'Szybki Strzelec',
        description: 'Sprawdź odpowiedzi w mniej niż 3 sekundy... i pomyl się co najmniej raz.',
        icon: 'fas fa-bolt',
        criteria: { type: 'quickIncorrectCheck', timeLimitSeconds: 3 }
    },
    // New time-related badges
    LIGHTNING_FAST: {
        id: 'LIGHTNING_FAST',
        name: 'Błyskawica',
        description: 'Rozwiąż zdanie perfekcyjnie w mniej niż 10 sekund!',
        icon: 'fas fa-fighter-jet',
        criteria: { type: 'perfectAndFast', timeLimitSeconds: 10 }
    },
    CONSISTENT_SPEEDSTER: {
        id: 'CONSISTENT_SPEEDSTER',
        name: 'Konsekwentny Sprinter',
        description: 'Ukończ 3 zdania z rzędu, każde w mniej niż 15 sekund!',
        icon: 'fas fa-tachometer-alt',
        criteria: { type: 'consecutiveFastSentences', timeLimitSeconds: 15, count: 3 }
    },
    MARATHON_RUNNER_5MIN: {
        id: 'MARATHON_RUNNER_5MIN',
        name: 'Maratończyk (5 min)',
        description: 'Spędź w grze łącznie 5 minut. Dobra rozgrzewka!',
        icon: 'fas fa-running',
        criteria: { type: 'totalPlayTime', totalSeconds: 300 }
    }
};

const EARNED_BADGES_KEY = 'podmiotISpolkaBadges';
const BADGE_PROGRESS_KEY_PREFIX = 'podmiotISpolka_badge_progress_';

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
 * @returns {Object|null} The badge definition if newly awarded, null otherwise.
 */
function awardBadge(badgeId) {
    const earnedBadges = getEarnedBadges();
    if (!earnedBadges[badgeId]) {
        earnedBadges[badgeId] = new Date().toISOString();
        saveEarnedBadges(earnedBadges);
        const badgeDef = BADGES[badgeId];
        console.log(`Badge awarded: ${badgeDef?.name || badgeId}!`);
        return badgeDef; // Return the badge definition if newly awarded
    }
    return null; // Return null if already earned or not found
}

/**
 * Gets progress for a specific badge criterion.
 * @param {string} criterionKey - Unique key for the progress (e.g., 'consecutiveSubjectCorrect')
 * @returns {any} The stored progress value, or a default (e.g., 0).
 */
function getBadgeProgress(criterionKey) {
    const item = localStorage.getItem(`${BADGE_PROGRESS_KEY_PREFIX}${criterionKey}`);
    try {
        return item ? JSON.parse(item) : 0; // Default to 0 for counts
    } catch (e) {
        console.warn(`Could not parse badge progress for ${criterionKey}, defaulting to 0.`);
        return 0;
    }
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
 * @param {number} currentLevelAfterXP - The player's current level after XP from this round is applied.
 * @returns {Array} An array of newly awarded badge definitions.
 */
export function checkAndAwardBadges(evaluationDetails, currentLevelAfterXP) {
    if (!evaluationDetails) return [];
    const newlyAwardedBadges = [];
    const earnedBadges = getEarnedBadges();

    // --- Update shared progress counters first ---
    // Perfect sentence streak
    if (evaluationDetails.isPerfectSentence !== undefined) {
        let perfectSentenceStreak = getBadgeProgress('perfect_sentence_streak');
        if (evaluationDetails.isPerfectSentence) {
            perfectSentenceStreak++;
        } else {
            perfectSentenceStreak = 0;
        }
        saveBadgeProgress('perfect_sentence_streak', perfectSentenceStreak);
    }

    // Total correct parts
    let totalCorrectParts = getBadgeProgress('total_correct_parts');
    const correctInThisRound = evaluationDetails.partsOfSpeechFeedback.filter(f => f.isCorrect).length;
    totalCorrectParts += correctInThisRound;
    saveBadgeProgress('total_correct_parts', totalCorrectParts);
    
    // Total sentences completed (for participation award)
    let sentencesCompleted = getBadgeProgress('sentences_completed_count');
    sentencesCompleted++;
    saveBadgeProgress('sentences_completed_count', sentencesCompleted);

    // Total play time (for Marathon Runner)
    if (evaluationDetails.timeTakenSeconds !== undefined) {
        let totalPlayTime = getBadgeProgress('total_play_time_seconds');
        totalPlayTime += evaluationDetails.timeTakenSeconds;
        saveBadgeProgress('total_play_time_seconds', totalPlayTime);
    }

    // Consecutive fast sentences (for Consistent Speedster)
    if (evaluationDetails.timeTakenSeconds !== undefined && BADGES.CONSISTENT_SPEEDSTER) { // Check if badge exists
        let consecutiveFast = getBadgeProgress('consecutive_fast_sentences');
        if (evaluationDetails.timeTakenSeconds < BADGES.CONSISTENT_SPEEDSTER.criteria.timeLimitSeconds) {
            consecutiveFast++;
        } else {
            consecutiveFast = 0;
        }
        saveBadgeProgress('consecutive_fast_sentences', consecutiveFast);
    }

    // --- Check Badges ---

    // SUBJECT_MASTER
    const subjectMasterBadge = BADGES.SUBJECT_MASTER;
    if (subjectMasterBadge && !earnedBadges[subjectMasterBadge.id]) {
        let consecutiveCorrectSubjects = getBadgeProgress('consecutive_podmiot_correct');
        let subjectAttemptedInThisRound = false;
        let subjectCorrectInThisRound = true;
        if (evaluationDetails.partsOfSpeechFeedback) {
            evaluationDetails.partsOfSpeechFeedback.forEach(feedback => {
                if (feedback.partOfSpeech === subjectMasterBadge.criteria.partOfSpeech) { 
                    subjectAttemptedInThisRound = true;
                    if (!feedback.isCorrect) {
                        subjectCorrectInThisRound = false;
                    }
                }
            });
        }
        if (subjectAttemptedInThisRound && subjectCorrectInThisRound) {
            consecutiveCorrectSubjects++;
        } else if (subjectAttemptedInThisRound && !subjectCorrectInThisRound) {
            consecutiveCorrectSubjects = 0;
        }
        saveBadgeProgress('consecutive_podmiot_correct', consecutiveCorrectSubjects);
        if (consecutiveCorrectSubjects >= subjectMasterBadge.criteria.count) {
            const awarded = awardBadge(subjectMasterBadge.id);
            if (awarded) newlyAwardedBadges.push(awarded);
        }
    }

    // PERFECT_STREAK_3 and PERFECT_STREAK_5
    [BADGES.PERFECT_STREAK_3, BADGES.PERFECT_STREAK_5].forEach(streakBadge => {
        if (streakBadge && !earnedBadges[streakBadge.id]) {
            if (getBadgeProgress('perfect_sentence_streak') >= streakBadge.criteria.count) {
                const awarded = awardBadge(streakBadge.id);
                if (awarded) newlyAwardedBadges.push(awarded);
            }
        }
    });

    // QUICK_LEARNER
    const quickLearnerBadge = BADGES.QUICK_LEARNER;
    if (quickLearnerBadge && !earnedBadges[quickLearnerBadge.id] && 
        evaluationDetails.isPerfectSentence && 
        !getBadgeProgress('first_correct_sentence_awarded')) {
        const awarded = awardBadge(quickLearnerBadge.id);
        if (awarded) {
            newlyAwardedBadges.push(awarded);
            saveBadgeProgress('first_correct_sentence_awarded', true);
        }
    }

    // VOCAB_VIRTUOSO
    const vocabBadge = BADGES.VOCAB_VIRTUOSO;
    if (vocabBadge && !earnedBadges[vocabBadge.id]) {
        if (getBadgeProgress('total_correct_parts') >= vocabBadge.criteria.count) {
            const awarded = awardBadge(vocabBadge.id);
            if (awarded) newlyAwardedBadges.push(awarded);
        }
    }

    // GRAMMAR_GURU
    const guruBadge = BADGES.GRAMMAR_GURU;
    if (guruBadge && !earnedBadges[guruBadge.id] && currentLevelAfterXP >= guruBadge.criteria.level) {
        const awarded = awardBadge(guruBadge.id);
        if (awarded) newlyAwardedBadges.push(awarded);
    }

    // CLUMSY_CLICKER
    const clumsyBadge = BADGES.CLUMSY_CLICKER;
    if (clumsyBadge && !earnedBadges[clumsyBadge.id]) {
        const mistakesInThisRound = evaluationDetails.partsOfSpeechFeedback.filter(f => !f.isCorrect && f.attempted !== null).length;
        if (mistakesInThisRound >= clumsyBadge.criteria.count) {
            const awarded = awardBadge(clumsyBadge.id);
            if (awarded) newlyAwardedBadges.push(awarded);
        }
    }

    // PARTICIPATION_AWARD
    const participationBadge = BADGES.PARTICIPATION_AWARD;
    if (participationBadge && !earnedBadges[participationBadge.id] && 
        getBadgeProgress('sentences_completed_count') >= 1 && 
        !getBadgeProgress('first_sentence_completed_awarded')) {
        const awarded = awardBadge(participationBadge.id);
        if (awarded) {
            newlyAwardedBadges.push(awarded);
            saveBadgeProgress('first_sentence_completed_awarded', true);
        }
    }

    // SPEEDY_GUESSER
    const speedyGuesserBadge = BADGES.SPEEDY_GUESSER;
    if (speedyGuesserBadge && !earnedBadges[speedyGuesserBadge.id] && 
        evaluationDetails.timeTakenSeconds !== undefined && 
        evaluationDetails.timeTakenSeconds < speedyGuesserBadge.criteria.timeLimitSeconds) {
        
        const hasAtLeastOneMistake = evaluationDetails.partsOfSpeechFeedback.some(f => !f.isCorrect && f.attempted !== null);
        if (hasAtLeastOneMistake) {
            const awarded = awardBadge(speedyGuesserBadge.id);
            if (awarded) newlyAwardedBadges.push(awarded);
        }
    }

    // LIGHTNING_FAST
    const lightningFastBadge = BADGES.LIGHTNING_FAST;
    if (lightningFastBadge && !earnedBadges[lightningFastBadge.id] &&
        evaluationDetails.isPerfectSentence &&
        evaluationDetails.timeTakenSeconds !== undefined &&
        evaluationDetails.timeTakenSeconds < lightningFastBadge.criteria.timeLimitSeconds) {
        const awarded = awardBadge(lightningFastBadge.id);
        if (awarded) newlyAwardedBadges.push(awarded);
    }

    // CONSISTENT_SPEEDSTER
    const consistentSpeedsterBadge = BADGES.CONSISTENT_SPEEDSTER;
    if (consistentSpeedsterBadge && !earnedBadges[consistentSpeedsterBadge.id]) {
        if (getBadgeProgress('consecutive_fast_sentences') >= consistentSpeedsterBadge.criteria.count) {
            const awarded = awardBadge(consistentSpeedsterBadge.id);
            if (awarded) newlyAwardedBadges.push(awarded);
        }
    }

    // MARATHON_RUNNER_5MIN
    const marathonBadge = BADGES.MARATHON_RUNNER_5MIN;
    if (marathonBadge && !earnedBadges[marathonBadge.id]) {
        if (getBadgeProgress('total_play_time_seconds') >= marathonBadge.criteria.totalSeconds) {
            const awarded = awardBadge(marathonBadge.id);
            if (awarded) newlyAwardedBadges.push(awarded);
        }
    }
    
    return newlyAwardedBadges;
} 