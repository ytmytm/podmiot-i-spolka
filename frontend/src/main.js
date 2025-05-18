import { SentenceBoard } from './components/SentenceBoard.js';
import { DragCard } from './components/DragCard.js';
import { initializeDragAndDrop } from './drag.js';
import { scorer } from './scorer.js';
import { ResultView } from './components/ResultView.js';
import { getXP, getLevel, addXP, getXPForNextLevel, getLevelProgressPercentage, checkAndAwardBadges, resetGamification, getEarnedBadges, BADGES as DefinedBadges } from './gamification.js';

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/public/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered: ', registration);
      })
      .catch(registrationError => {
        console.log('Service Worker registration failed: ', registrationError);
      });
  });
}

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
    const playerBadgesContainer = document.getElementById('player-badges-container');
    const resetGameButtonHeader = document.getElementById('reset-game-button-header');
    const badgeEarnedNotification = document.getElementById('badge-earned-notification');
    const badgeNotifIcon = document.getElementById('badge-notif-icon');
    const badgeNotifName = document.getElementById('badge-notif-name');
    const badgeNotifDescription = document.getElementById('badge-notif-description');
    const clickToCorrectHint = document.getElementById('click-to-correct-hint');

    // --- Game State ---
    let sentences = [];
    let currentSentenceIndex = 0;
    let currentSentenceData = null;
    let userAnswers = {}; // Stores { tokenIndex: partOfSpeech }
    let currentSentenceBoardElement = null;
    let totalGameScore = 0;
    let gameInProgress = false;
    let sentenceLoadTime = null; // For timing sentence completion

    // --- Parts of Speech Available for Dragging ---
    // These should ideally match the parts used in sentences_pl.json
    const availablePartsOfSpeech = [
        "Podmiot", "Orzeczenie", "Przydawka", "Dopełnienie", "Okolicznik",
        "Okolicznik Miejsca", "Okolicznik Czasu", 
        "Okolicznik Sposobu", "Okolicznik Celu", "Okolicznik Przyczyny"
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
        updatePlayerBadgesUI();
    }

    function updatePlayerBadgesUI() {
        if (!playerBadgesContainer) return;
        playerBadgesContainer.innerHTML = ''; // Clear existing badges
        const earnedBadges = getEarnedBadges(); // { badgeId: timestamp, ... }
        const earnedBadgeIds = Object.keys(earnedBadges);

        if (earnedBadgeIds.length === 0) {
            // playerBadgesContainer.textContent = 'Brak odznak'; // Optional: message if no badges
            return;
        }

        earnedBadgeIds.forEach(badgeId => {
            const badgeDef = DefinedBadges[badgeId];
            if (badgeDef) {
                const badgeElement = document.createElement('span');
                badgeElement.className = 'player-badge';
                badgeElement.title = `${badgeDef.name} - ${badgeDef.description}`;
                
                const iconElement = document.createElement('i');
                iconElement.className = badgeDef.icon; // e.g., "fas fa-crown"
                badgeElement.appendChild(iconElement);
                
                // Optionally, add badge name next to icon if design allows
                // const nameElement = document.createElement('span');
                // nameElement.textContent = badgeDef.name;
                // nameElement.style.marginLeft = '4px';
                // badgeElement.appendChild(nameElement);

                playerBadgesContainer.appendChild(badgeElement);
            }
        });
    }

    function showLevelUpNotification(newLevel) {
        newLevelAchievedDisplay.textContent = newLevel;
        levelUpNotification.style.display = 'block';
        setTimeout(() => {
            levelUpNotification.style.display = 'none';
        }, 3000); // Hide after 3 seconds
    }

    function showBadgeNotification(badgeDef) {
        if (!badgeEarnedNotification || !badgeDef) return;

        if (badgeNotifIcon) {
            badgeNotifIcon.className = badgeDef.icon; // Set icon class
        }
        if (badgeNotifName) {
            badgeNotifName.textContent = badgeDef.name;
        }
        if (badgeNotifDescription) {
            badgeNotifDescription.textContent = badgeDef.description;
        }
        
        badgeEarnedNotification.style.display = 'block';
        setTimeout(() => {
            badgeEarnedNotification.style.display = 'none';
        }, 4000); // Hide after 4 seconds (slightly longer for reading description)
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
        
        // Add or update the hint text
        if (clickToCorrectHint) {
            clickToCorrectHint.textContent = "Pomyliłeś się? Kliknij na słowie, aby usunąć odpowiedź.";
            clickToCorrectHint.style.display = 'block'; // Make sure it's visible
        } else {
            // Fallback if element wasn't in HTML, create and append it (less ideal)
            const hintElement = document.createElement('p');
            hintElement.id = 'click-to-correct-hint';
            hintElement.className = 'click-hint';
            hintElement.textContent = "Pomyliłeś się? Kliknij na słowie, aby usunąć odpowiedź.";
            partsTrayContainer.insertAdjacentElement('afterend', hintElement);
        }

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
        sentenceLoadTime = Date.now(); // Start timer for the sentence

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
            slotElement.classList.remove('correct-drop', 'incorrect-drop', 'assigned', 'partial-correct-drop');
            slotElement.removeAttribute('data-assigned-part');
            console.log(`Usunięto odpowiedź dla tokenu ${tokenIndex}`);
        }
    }

    function handleDrop(partOfSpeech, tokenIndex, draggedElement, droppedOnElement) {
        console.log(`Upuszczono '${partOfSpeech}' na token index ${tokenIndex}`);
        userAnswers[tokenIndex] = partOfSpeech;
        
        if (droppedOnElement) {
            // Always reset to the original word first
            droppedOnElement.textContent = currentSentenceData.tokens[tokenIndex].word;
            // Then append the new part of speech
            droppedOnElement.textContent += ` (${partOfSpeech})`;
            droppedOnElement.classList.add('assigned');
            droppedOnElement.dataset.assignedPart = partOfSpeech;
        }
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

        // --- Badge Logic ---
        const evaluationDetails = {
            isPerfectSentence: scoreResult.results.every(r => r.isCorrect),
            partsOfSpeechFeedback: scoreResult.results.map(r => ({
                word: r.word,
                attempted: r.userAnswer,
                actual: r.correctAnswer, // This is the actual part of speech of the word
                isCorrect: r.isCorrect,
                partOfSpeech: r.correctAnswer // For "Mistrz Podmiotu", criteria looks for actual POS
            })),
            timeTakenSeconds: sentenceLoadTime ? (Date.now() - sentenceLoadTime) / 1000 : undefined
        };
        const newlyAwardedBadges = checkAndAwardBadges(evaluationDetails, gamificationUpdate.level);
        updatePlayerBadgesUI(); // Update the static display of badges

        if (newlyAwardedBadges && newlyAwardedBadges.length > 0) {
            newlyAwardedBadges.forEach((badgeDef, index) => {
                // If multiple badges are awarded at once, show them sequentially with a delay
                setTimeout(() => {
                    showBadgeNotification(badgeDef);
                }, index * 4500); // Stagger notifications
            });
        }
        // --- End Badge Logic ---

        scoreDisplay.textContent = `Wynik za to zdanie: ${scoreResult.totalScore} pkt. Łączny wynik: ${totalGameScore}`;
        feedbackContainer.innerHTML = ''; // Clear previous feedback

        // Display time taken for the sentence
        if (evaluationDetails.timeTakenSeconds !== undefined) {
            const timeP = document.createElement('p');
            timeP.className = 'time-taken-feedback';
            timeP.textContent = `Czas rozwiązania: ${evaluationDetails.timeTakenSeconds.toFixed(1)} sekund.`;
            feedbackContainer.appendChild(timeP);
        }

        scoreResult.results.forEach(result => {
            const p = document.createElement('p');
            const slotElement = currentSentenceBoardElement.querySelector(`#word-slot-${result.tokenIndex}`);
            
            let feedbackText = `Słowo "${result.word}": Twoja odpowiedź: ${result.userAnswer || 'brak'}. Poprawna: ${result.correctAnswer}. Punkty: ${result.points}`;
            p.textContent = feedbackText;

            if (slotElement) {
                slotElement.classList.remove('assigned'); 

                if (result.isCorrect) {
                    p.classList.add('correct');
                    slotElement.classList.add('correct-drop');
                } else if (result.isPartiallyCorrect) {
                    p.classList.add('partial-correct'); // New class for text
                    slotElement.classList.add('partial-correct-drop'); // New class for slot
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

    // Shared function to reset and start a new game
    const resetAndStartNewGame = () => {
        resetGamification(); // Resets XP, Level, Badges, Badge Progress from gamification.js
        // High scores in ResultView are separate, allow them to persist for now.
        // If ResultView is visible, it might be good to remove it or hide it.
        const existingResultView = document.querySelector('.result-view-container');
        if (existingResultView) existingResultView.remove();
        
        startGame(); // Resets sentence index, total game score, and re-renders game area.
    };

    function showGameResults() {
        gameInProgress = false;
        gameArea.style.display = 'none';
        controlsArea.style.display = 'none';
        resultsArea.style.display = 'none';
        mainHeader.textContent = 'Wyniki Gry';
        updatePlayerStatsUI(); // Ensure stats are up-to-date on results screen
        
        // The existing onPlayAgainCallback for ResultView is just startGame.
        // The onStartNewGameCallback for ResultView will now use the shared resetAndStartNewGame.
        const resultViewElement = ResultView(totalGameScore, startGame, resetAndStartNewGame);
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

    // Event listener for the new header reset button
    if(resetGameButtonHeader) {
        resetGameButtonHeader.addEventListener('click', resetAndStartNewGame);
    }
}); 