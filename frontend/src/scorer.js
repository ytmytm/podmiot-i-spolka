/**
 * @file scorer.js
 * Implements the scoring logic for the game.
 */

/**
 * Evaluates the user's answers against the correct sentence structure.
 *
 * @param {Array<object>} sentenceTokens - The array of token objects for the current sentence.
 *   Each token object should have at least:
 *   - {string} word - The word itself (for context, not directly used in scoring here).
 *   - {string} part - The correct part of speech for this token.
 * @param {object} userAnswers - An object mapping token index to the user's assigned part of speech.
 *   Example: { 0: 'Podmiot', 1: 'Orzeczenie', 2: 'Przydawka' }
 *   Indices correspond to the sentenceTokens array.
 * @param {object} scoringRules - Rules for calculating points.
 *   Example: { correct: 10, partial: 3, incorrect: -2 }
 *   (Partial not implemented in this initial version, but structure allows for it)
 *
 * @returns {object} An object containing:
 *   - {number} totalScore - The calculated total score for the sentence.
 *   - {Array<object>} results - An array with evaluation for each token:
 *     - {number} tokenIndex - The index of the token.
 *     - {string} word - The word of the token.
 *     - {string} correctAnswer - The correct part of speech.
 *     - {string} userAnswer - The user's answer (or null if not answered).
 *     - {boolean} isCorrect - True if the user's answer was correct.
 *     - {boolean} isPartiallyCorrect - True if the user's answer was partially correct.
 *     - {number} points - Points awarded for this specific token.
 */
export function scorer(sentenceTokens, userAnswers, scoringRules = { correct: 10, partial: 5, incorrect: -2 }) {
  let totalScore = 0;
  const results = [];

  if (!sentenceTokens || !Array.isArray(sentenceTokens)) {
    console.error("scorer: sentenceTokens is undefined or not an array");
    return { totalScore: 0, results: [], error: "Invalid sentenceTokens" };
  }
  if (!userAnswers || typeof userAnswers !== 'object') {
    console.error("scorer: userAnswers is undefined or not an object");
    // Allow empty answers, treat as all incorrect
    userAnswers = {}; 
  }
  if (!scoringRules || typeof scoringRules.correct !== 'number' || typeof scoringRules.incorrect !== 'number') {
    console.warn("scorer: Invalid or missing scoringRules, using defaults.");
    scoringRules = { correct: 10, partial: 5, incorrect: -2 };
  }
  // Ensure partial score is defined, even if not initially passed in default
  if (typeof scoringRules.partial !== 'number') {
    scoringRules.partial = 5; // Default partial score
  }

  const specificOkolicznikTypes = [
    "Okolicznik Miejsca", "Okolicznik Czasu", 
    "Okolicznik Sposobu", "Okolicznik Celu", "Okolicznik Przyczyny",
    "Okolicznik Warunku", "Okolicznik Przyzwolenia", "Okolicznik Narzędzia",
    "Okolicznik Miary", "Okolicznik Stopnia"
  ];

  sentenceTokens.forEach((token, index) => {
    const correctAnswer = token.part;
    const userAnswer = userAnswers[index] || null;
    let isCorrect = false;
    let isPartiallyCorrect = false; // New flag
    let points = 0;

    if (userAnswer) {
      console.log(`Scoring token: "${token.word}", User: "${userAnswer}", Correct: "${correctAnswer}", Rules: ${JSON.stringify(scoringRules)}`); // DEBUG LOG
      if (userAnswer === correctAnswer) {
        isCorrect = true;
        points = scoringRules.correct;
      } else if (userAnswer === "Okolicznik" && specificOkolicznikTypes.includes(correctAnswer)) {
        console.log('Partial Okolicznik match triggered'); // DEBUG LOG
        isPartiallyCorrect = true;
        points = scoringRules.partial;
        if (points === undefined) { // Fallback if partial somehow undefined
            console.warn("Partial points undefined, falling back to 0 for partial Okolicznik match");
            points = 0; 
        }
        console.log(`Points for partial Okolicznik ("${token.word}"): ${points}`); // DEBUG LOG FOR PARTIAL POINTS
      } else {
        points = scoringRules.incorrect;
      }
    } else {
      points = scoringRules.incorrect;
    }

    totalScore += points;
    results.push({
      tokenIndex: index,
      word: token.word,
      correctAnswer: correctAnswer,
      userAnswer: userAnswer,
      isCorrect: isCorrect,
      isPartiallyCorrect: isPartiallyCorrect, // Add new flag to results
      points: points
    });
  });

  return { totalScore, results };
}

// --- Basic Test Area ---
export function testScorer() {
  console.log("--- Starting Scorer Tests ---");

  const mockSentenceTokens1 = [
    { word: "Ala", part: "Podmiot" },
    { word: "ma", part: "Orzeczenie" },
    { word: "kota", part: "Dopełnienie" } // Assuming Dopełnienie is a valid part
  ];

  const mockUserAnswers1_correct = {
    0: "Podmiot",
    1: "Orzeczenie",
    2: "Dopełnienie"
  };

  const mockUserAnswers1_partial = {
    0: "Podmiot",
    1: "Orzeczenie",
    // Index 2 not answered
  };

  const mockUserAnswers1_incorrect = {
    0: "Orzeczenie",
    1: "Podmiot",
    2: "Podmiot"
  };
  
  const mockUserAnswers1_mixed = {
    0: "Podmiot",     // Correct
    1: "Przydawka", // Incorrect
    2: "Dopełnienie"  // Correct
  };

  const mockSentenceTokens1_okolicznik = [
    { word: "Poszedł", part: "Orzeczenie" },
    { word: "szybko", part: "Okolicznik Sposobu" },
    { word: "do sklepu", part: "Okolicznik Miejsca" }
  ];

  const mockUserAnswers_okolicznik_partial = {
    0: "Orzeczenie",         // Correct
    1: "Okolicznik",         // Partially correct (Sposobu)
    2: "Okolicznik"          // Partially correct (Miejsca)
  };
  
  const mockUserAnswers_okolicznik_mixed = {
    0: "Orzeczenie",         // Correct
    1: "Okolicznik Sposobu", // Correct
    2: "Przydawka"           // Incorrect, correct was Okolicznik Miejsca
  };
  
  const mockUserAnswers_okolicznik_general_correct = {
    0: "Orzeczenie",
    1: "Okolicznik Sposobu",
    2: "Okolicznik Miejsca" 
  };

  const scoringRulesWithPartial = { correct: 10, partial: 5, incorrect: -2 };

  // Test Case 1: All correct
  const score1 = scorer(mockSentenceTokens1, mockUserAnswers1_correct, scoringRulesWithPartial);
  console.log("Test Case 1 (All Correct):", JSON.stringify(score1, null, 2));
  console.assert(score1.totalScore === 30, "Test 1 Failed: Total score incorrect. Expected 30, got " + score1.totalScore);
  console.assert(score1.results.length === 3, "Test 1 Failed: Results length incorrect.");
  console.assert(score1.results.every(r => r.isCorrect), "Test 1 Failed: Not all answers marked correct.");

  // Test Case 2: Partial answers (missing answer for one token)
  const score2 = scorer(mockSentenceTokens1, mockUserAnswers1_partial, scoringRulesWithPartial);
  console.log("Test Case 2 (Partial/Missing):", JSON.stringify(score2, null, 2));
  // Expected: Podmiot (correct, +10), Orzeczenie (correct, +10), Dopełnienie (no answer, -2)
  // Total = 10 + 10 - 2 = 18
  console.assert(score2.totalScore === 18, "Test 2 Failed: Total score incorrect. Expected 18, got " + score2.totalScore);
  console.assert(score2.results[0].isCorrect && score2.results[1].isCorrect && !score2.results[2].isCorrect, "Test 2 Failed: Correctness flags wrong.");
  console.assert(score2.results[2].userAnswer === null, "Test 2 Failed: Missing answer not recorded as null.");

  // Test Case 3: All incorrect
  const score3 = scorer(mockSentenceTokens1, mockUserAnswers1_incorrect, scoringRulesWithPartial);
  console.log("Test Case 3 (All Incorrect):", JSON.stringify(score3, null, 2));
  // Expected: 3 * -2 = -6
  console.assert(score3.totalScore === -6, "Test 3 Failed: Total score incorrect. Expected -6, got " + score3.totalScore);
  console.assert(score3.results.every(r => !r.isCorrect), "Test 3 Failed: Not all answers marked incorrect.");

  // Test Case 4: Mixed (correct and incorrect)
  const score4 = scorer(mockSentenceTokens1, mockUserAnswers1_mixed, scoringRulesWithPartial);
  console.log("Test Case 4 (Mixed):", JSON.stringify(score4, null, 2));
  // Expected: Podmiot (correct, +10), Przydawka (incorrect, -2), Dopełnienie (correct, +10)
  // Total = 10 - 2 + 10 = 18
  console.assert(score4.totalScore === 18, "Test 4 Failed: Total score incorrect for mixed. Expected 18, got " + score4.totalScore);
  console.assert(score4.results[0].isCorrect && !score4.results[1].isCorrect && score4.results[2].isCorrect, "Test 4 Failed: Correctness flags wrong for mixed.");

  // Test Case 5: Empty userAnswers
  const score5 = scorer(mockSentenceTokens1, {}, scoringRulesWithPartial);
  console.log("Test Case 5 (Empty Answers):", JSON.stringify(score5, null, 2));
  // Expected: 3 * -2 = -6 (all treated as incorrect because no answer given)
  console.assert(score5.totalScore === -6, "Test 5 Failed: Total score incorrect for empty answers. Expected -6, got " + score5.totalScore);

  // Test Case 6: Null/undefined sentenceTokens or userAnswers
  const score6a = scorer(null, mockUserAnswers1_correct, scoringRulesWithPartial);
  console.assert(score6a.error, "Test 6a Failed: Should return error for null sentenceTokens");
  const score6b = scorer(mockSentenceTokens1, undefined, scoringRulesWithPartial);
  // This should treat undefined userAnswers as empty, so similar to score5
  console.assert(score6b.totalScore === -6, "Test 6b Failed: Total score incorrect for undefined userAnswers. Expected -6, got " + score6b.totalScore);

  // Test Case 7: Partial Okolicznik matches
  const score7 = scorer(mockSentenceTokens1_okolicznik, mockUserAnswers_okolicznik_partial, scoringRulesWithPartial);
  console.log("Test Case 7 (Partial Okolicznik):", JSON.stringify(score7, null, 2));
  // Expected: Orzeczenie (correct, +10), Okolicznik (partial for Sposobu, +5), Okolicznik (partial for Miejsca, +5)
  // Total = 10 + 5 + 5 = 20
  console.assert(score7.totalScore === 20, "Test 7 Failed: Total score incorrect. Expected 20, got " + score7.totalScore);
  console.assert(score7.results[0].isCorrect && !score7.results[0].isPartiallyCorrect, "Test 7 Failed: Orzeczenie should be fully correct.");
  console.assert(!score7.results[1].isCorrect && score7.results[1].isPartiallyCorrect, "Test 7 Failed: First Okolicznik should be partially correct.");
  console.assert(score7.results[1].points === 5, "Test 7 Failed: Partial Okolicznik points incorrect. Expected 5.");
  console.assert(!score7.results[2].isCorrect && score7.results[2].isPartiallyCorrect, "Test 7 Failed: Second Okolicznik should be partially correct.");
  console.assert(score7.results[2].points === 5, "Test 7 Failed: Partial Okolicznik points incorrect. Expected 5.");

  // Test Case 8: Mixed Okolicznik (one fully correct specific, one incorrect)
  const score8 = scorer(mockSentenceTokens1_okolicznik, mockUserAnswers_okolicznik_mixed, scoringRulesWithPartial);
  console.log("Test Case 8 (Mixed Okolicznik Specific/Incorrect):", JSON.stringify(score8, null, 2));
  // Expected: Orzeczenie (correct, +10), Okolicznik Sposobu (correct, +10), Przydawka (incorrect, -2)
  // Total = 10 + 10 - 2 = 18
  console.assert(score8.totalScore === 18, "Test 8 Failed: Total score incorrect. Expected 18, got " + score8.totalScore);
  console.assert(score8.results[1].isCorrect && !score8.results[1].isPartiallyCorrect, "Test 8 Failed: Specific Okolicznik Sposobu should be fully correct.");
  console.assert(!score8.results[2].isCorrect && !score8.results[2].isPartiallyCorrect, "Test 8 Failed: Incorrect Przydawka should not be partially correct.");
  console.assert(score8.results[2].points === -2, "Test 8 Failed: Incorrect Przydawka points incorrect.");

  // Test Case 9: All specific Okoliczniki correct (no partials)
  const score9 = scorer(mockSentenceTokens1_okolicznik, mockUserAnswers_okolicznik_general_correct, scoringRulesWithPartial);
  console.log("Test Case 9 (All Specific Okoliczniki Correct):", JSON.stringify(score9, null, 2));
  // Expected: Orzeczenie (+10), Okolicznik Sposobu (+10), Okolicznik Miejsca (+10)
  // Total = 30
  console.assert(score9.totalScore === 30, "Test 9 Failed: Total score incorrect. Expected 30, got " + score9.totalScore);
  console.assert(score9.results.every(r => r.isCorrect && !r.isPartiallyCorrect), "Test 9 Failed: All should be fully correct, not partial.");


  console.log("--- Scorer Tests Finished ---");
  // Check console for assertion messages if any tests failed.
}

// Example of how to run the test:
// import { testScorer } from './scorer.js'; testScorer(); 