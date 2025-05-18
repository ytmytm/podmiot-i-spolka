import { SentenceBoard } from './components/SentenceBoard.js';
import { DragCard } from './components/DragCard.js';
import { initializeDragAndDrop } from './drag.js';
import { scorer } from './scorer.js';
import { ResultView } from './components/ResultView.js';
import { getXP, getLevel, addXP, getXPForNextLevel, getLevelProgressPercentage } from './gamification.js';

// --- DOM Elements ---
document.addEventListener('DOMContentLoaded', () => {
    const sentenceDisplayContainer = document.getElementById('sentence-display-container');
    const partsTrayContainer = document.getElementById('parts-tray-container');
    const checkAnswersButton = document.getElementById('check-answers-button');
    const nextSentenceButton = document.getElementById('next-sentence-button');
    const scoreDisplay = document.getElementById('score-display');
    const feedbackContainer = document.getElementById('feedback-container');
    const resultsArea = document.getElementById('results-area');
    const gameArea = document.getElementById('game-area');
    const controlsArea = document.getElementById('controls-area');
    const mainHeader = document.querySelector('header h1');
    const playerLevelDisplay = document.getElementById('player-level');
    const playerXPDisplay = document.getElementById('player-xp');
    const xpToNextLevelDisplay = document.getElementById('xp-to-next-level');
    const xpBarFill = document.getElementById('xp-bar-fill');
    const levelUpNotification = document.getElementById('level-up-notification');
    const newLevelAchievedDisplay = document.getElementById('new-level-achieved');

    // --- Game State ---
    let sentences = [];
    let currentSentenceIndex = 0;
    let currentSentenceData = null;
    let userAnswers = {}; // Stores { tokenIndex: partOfSpeech }
    let currentSentenceBoardElement = null;
    let totalGameScore = 0;
    let gameInProgress = false;

    // --- Parts of Speech Available for Dragging ---
    // These should ideally match the parts used in sentences_pl.json
    const availablePartsOfSpeech = [
        "Podmiot", "Orzeczenie", "Przydawka", 
        "Okolicznik Miejsca", "Okolicznik Czasu", 
        "Okolicznik Sposobu", "Okolicznik Celu", "Okolicznik Przyczyny"
        // "Dopełnienie" // Add if used in your sentences
    ];

    function updatePlayerStatsUI() {
        const currentXP = getXP();
        const currentLevel = getLevel();
        const xpForNext = getXPForNextLevel();
        const progressPercent = getLevelProgressPercentage();

        playerLevelDisplay.textContent = currentLevel;
        playerXPDisplay.textContent = currentXP;
        // XP needed to reach the *start* of the next level, from 0 XP.
        // If currentXP is 50, level 1 (needs 100 for level 2), then xpForNext will be 100.
        // "Do nast. poziomu" should show how many more points are needed for level up, or total for next level.
        // Let's show total for next level (e.g. "Level 2: 100XP")
        xpToNextLevelDisplay.textContent = `${xpForNext} XP (dla poz. ${currentLevel + 1})`;
        if (xpBarFill) {
            xpBarFill.style.width = `${progressPercent}%`;
        }
    }

    function showLevelUpNotification(newLevel) {
        newLevelAchievedDisplay.textContent = newLevel;
        levelUpNotification.style.display = 'block';
        setTimeout(() => {
            levelUpNotification.style.display = 'none';
        }, 3000); // Hide after 3 seconds
    }

    // --- Load Data ---
    async function loadGameData() {
        try {
            const response = await fetch('../data/sentences_pl.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            sentences = await response.json();
            if (sentences.length > 0) {
                startGame();
            } else {
                sentenceDisplayContainer.innerHTML = '<p>Brak zdań do wyświetlenia.</p>';
            }
        } catch (error) {
            console.error("Nie udało się załadować danych zdań:", error);
            sentenceDisplayContainer.innerHTML = '<p>Wystąpił błąd podczas ładowania zdań.</p>';
        }
        updatePlayerStatsUI(); // Initial UI update for stats
    }

    function startGame() {
        currentSentenceIndex = 0;
        totalGameScore = 0;
        gameInProgress = true;
        mainHeader.textContent = 'Analiza Zdania';
        resultsArea.style.display = 'none';
        gameArea.style.display = 'flex';
        controlsArea.style.display = 'block';
        const existingResultView = document.querySelector('.result-view-container');
        if (existingResultView) existingResultView.remove();
        updatePlayerStatsUI(); // Update stats display at game start
        loadSentence(currentSentenceIndex);
        renderDragCards();
    }

    // --- Render Functions ---
    function renderDragCards() {
        partsTrayContainer.innerHTML = '<h2>Części Zdania:</h2>'; // Clear previous cards if any
        availablePartsOfSpeech.forEach(part => {
            const card = DragCard(part, part); // Label is same as part for now
            partsTrayContainer.appendChild(card);
        });
        // Re-initialize drag and drop for newly created cards
        // Note: This assumes SentenceBoard is already rendered or will be soon for the droppables
        initializeDragAndDrop('.drag-card', '.word-slot', handleDrop);
    }

    function loadSentence(index) {
        if (!gameInProgress) return;

        if (index >= sentences.length) {
            showGameResults();
            return;
        }
        currentSentenceData = sentences[index];
        userAnswers = {}; // Reset answers for the new sentence
        resultsArea.style.display = 'none';
        feedbackContainer.innerHTML = '';
        scoreDisplay.textContent = '';

        // Clear previous sentence board
        const existingBoard = sentenceDisplayContainer.querySelector('.sentence-board');
        if (existingBoard) {
            existingBoard.remove();
        }

        currentSentenceBoardElement = SentenceBoard(currentSentenceData, handleWordSlotClick);
        sentenceDisplayContainer.appendChild(currentSentenceBoardElement); 
        
        // Ensure drag and drop is initialized *after* SentenceBoard creates .word-slot elements
        // and DragCards are present.
        initializeDragAndDrop('.drag-card', '.word-slot', handleDrop);

        checkAnswersButton.style.display = 'inline-block';
        nextSentenceButton.style.display = 'none';
    }

    // --- Event Handlers ---
    function handleWordSlotClick(tokenWord, tokenIndex) {
        console.log(`Kliknięto slot: ${tokenWord} (index: ${tokenIndex})`);
        // This can be used for other interactions, e.g., clearing a dropped item
        // or selecting a slot before choosing a part of speech from a static list.
        // For drag & drop, primary interaction is via handleDrop.

        // Example: If a card was previously dropped here, remove it
        const slotElement = currentSentenceBoardElement.querySelector(`#word-slot-${tokenIndex}`);
        if (slotElement && userAnswers[tokenIndex]) {
            delete userAnswers[tokenIndex];
            slotElement.textContent = currentSentenceData.tokens[tokenIndex].word; // Restore original word
            slotElement.classList.remove('correct-drop', 'incorrect-drop', 'assigned');
            slotElement.removeAttribute('data-assigned-part');
            console.log(`Usunięto odpowiedź dla tokenu ${tokenIndex}`);
        }
    }

    function handleDrop(partOfSpeech, tokenIndex, draggedElement, droppedOnElement) {
        console.log(`Upuszczono '${partOfSpeech}' na token index ${tokenIndex}`);
        userAnswers[tokenIndex] = partOfSpeech;
        
        // Visual feedback on the slot
        if (droppedOnElement) {
            if (!droppedOnElement.textContent.startsWith(currentSentenceData.tokens[tokenIndex].word)) {
                droppedOnElement.textContent = currentSentenceData.tokens[tokenIndex].word;
            }
            droppedOnElement.textContent += ` (${partOfSpeech})`;
            droppedOnElement.classList.add('assigned'); // General class for styling assigned slots
            droppedOnElement.dataset.assignedPart = partOfSpeech;
        }
        // Note: Correct/Incorrect feedback will be applied after clicking "Check Answers"
    }

    checkAnswersButton.addEventListener('click', () => {
        if (!currentSentenceData || !gameInProgress) return;

        const scoreResult = scorer(currentSentenceData.tokens, userAnswers);
        totalGameScore += scoreResult.totalScore;
        
        // Add points to gamification system
        const gamificationUpdate = addXP(scoreResult.totalScore);
        updatePlayerStatsUI(); // Update UI with new XP/Level

        if (gamificationUpdate.leveledUp) {
            showLevelUpNotification(gamificationUpdate.level);
        }

        scoreDisplay.textContent = `Wynik za to zdanie: ${scoreResult.totalScore} pkt. Łączny wynik: ${totalGameScore}`;
        feedbackContainer.innerHTML = ''; // Clear previous feedback

        scoreResult.results.forEach(result => {
            const p = document.createElement('p');
            const slotElement = currentSentenceBoardElement.querySelector(`#word-slot-${result.tokenIndex}`);
            
            let feedbackText = `Słowo "${result.word}": Twoja odpowiedź: ${result.userAnswer || 'brak'}. Poprawna: ${result.correctAnswer}. Punkty: ${result.points}`;
            p.textContent = feedbackText;

            if (slotElement) {
                slotElement.classList.remove('assigned'); // Remove general assigned class
                 // Update text to show only the original word during feedback phase, or keep assigned one.
                // slotElement.textContent = currentSentenceData.tokens[result.tokenIndex].word;

                if (result.isCorrect) {
                    p.classList.add('correct');
                    slotElement.classList.add('correct-drop');
                } else {
                    p.classList.add('incorrect');
                    slotElement.classList.add('incorrect-drop');
                }
            }
            feedbackContainer.appendChild(p);
        });

        resultsArea.style.display = 'block';
        checkAnswersButton.style.display = 'none';
        nextSentenceButton.style.display = 'inline-block';
    });

    nextSentenceButton.addEventListener('click', () => {
        if (!gameInProgress) return;
        currentSentenceIndex++;
        loadSentence(currentSentenceIndex);
    });

    function showGameResults() {
        gameInProgress = false;
        gameArea.style.display = 'none';
        controlsArea.style.display = 'none';
        resultsArea.style.display = 'none';
        mainHeader.textContent = 'Wyniki Gry';
        updatePlayerStatsUI(); // Ensure stats are up-to-date on results screen
        const resultViewElement = ResultView(totalGameScore, startGame);
        const appContainer = document.querySelector('.app-container');
        const footer = appContainer.querySelector('footer');
        if (footer) {
            appContainer.insertBefore(resultViewElement, footer);
        } else {
            appContainer.appendChild(resultViewElement);
        }
    }

    // --- Initial Load ---
    loadGameData();
}); 