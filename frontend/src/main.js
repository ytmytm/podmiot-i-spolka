import { SentenceBoard } from './components/SentenceBoard.js';
import { DragCard } from './components/DragCard.js';
import { initializeDragAndDrop } from './drag.js';
import { scorer } from './scorer.js';

// --- DOM Elements ---
document.addEventListener('DOMContentLoaded', () => {
    const sentenceDisplayContainer = document.getElementById('sentence-display-container');
    const partsTrayContainer = document.getElementById('parts-tray-container');
    const checkAnswersButton = document.getElementById('check-answers-button');
    const nextSentenceButton = document.getElementById('next-sentence-button');
    const scoreDisplay = document.getElementById('score-display');
    const feedbackContainer = document.getElementById('feedback-container');
    const resultsArea = document.getElementById('results-area');

    // --- Game State ---
    let sentences = [];
    let currentSentenceIndex = 0;
    let currentSentenceData = null;
    let userAnswers = {}; // Stores { tokenIndex: partOfSpeech }
    let currentSentenceBoardElement = null;

    // --- Parts of Speech Available for Dragging ---
    // These should ideally match the parts used in sentences_pl.json
    const availablePartsOfSpeech = [
        "Podmiot", "Orzeczenie", "Przydawka", 
        "Okolicznik Miejsca", "Okolicznik Czasu", 
        "Okolicznik Sposobu", "Okolicznik Celu", "Okolicznik Przyczyny"
        // "Dopełnienie" // Add if used in your sentences
    ];

    // --- Load Data ---
    async function loadGameData() {
        try {
            const response = await fetch('../data/sentences_pl.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            sentences = await response.json();
            if (sentences.length > 0) {
                loadSentence(currentSentenceIndex);
                renderDragCards();
            } else {
                sentenceDisplayContainer.innerHTML = '<p>Brak zdań do wyświetlenia.</p>';
            }
        } catch (error) {
            console.error("Nie udało się załadować danych zdań:", error);
            sentenceDisplayContainer.innerHTML = '<p>Wystąpił błąd podczas ładowania zdań.</p>';
        }
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
        if (index >= sentences.length) {
            sentenceDisplayContainer.innerHTML = "<p>Gratulacje! Ukończyłeś wszystkie zdania.</p>";
            checkAnswersButton.style.display = 'none';
            nextSentenceButton.style.display = 'none';
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
            droppedOnElement.textContent = `${currentSentenceData.tokens[tokenIndex].word} (${partOfSpeech})`;
            droppedOnElement.classList.add('assigned'); // General class for styling assigned slots
            droppedOnElement.dataset.assignedPart = partOfSpeech;
        }
        // Note: Correct/Incorrect feedback will be applied after clicking "Check Answers"
    }

    checkAnswersButton.addEventListener('click', () => {
        if (!currentSentenceData) return;

        const scoreResult = scorer(currentSentenceData.tokens, userAnswers);
        scoreDisplay.textContent = `Twój wynik: ${scoreResult.totalScore} punktów`;
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
        currentSentenceIndex++;
        loadSentence(currentSentenceIndex);
        // Re-render drag cards in case their state needs resetting or if they are dynamic
        // For now, they are static, but this is good practice if they could change.
        // renderDragCards(); // Not strictly necessary if cards don't change per sentence
    });

    // --- Initial Load ---
    loadGameData();
}); 