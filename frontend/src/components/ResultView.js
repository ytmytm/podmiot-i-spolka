/**
 * @file ResultView.js
 * Component to display the game results and a leaderboard from localStorage.
 */

const MAX_HIGH_SCORES = 5; // Max number of high scores to store and display
const HIGH_SCORES_KEY = 'czesciZdaniaHighScores';

/**
 * Retrieves high scores from localStorage.
 * @returns {Array<object>} Array of high score objects { name: string, score: number }.
 */
function getHighScores() {
    const scoresJSON = localStorage.getItem(HIGH_SCORES_KEY);
    return scoresJSON ? JSON.parse(scoresJSON) : [];
}

/**
 * Saves a new score to the high scores list in localStorage.
 * Keeps the list sorted and limited to MAX_HIGH_SCORES.
 * @param {string} name - Player's name.
 * @param {number} score - Player's score.
 */
function saveHighScore(name, score) {
    const scores = getHighScores();
    scores.push({ name, score });
    scores.sort((a, b) => b.score - a.score); // Sort descending by score
    const newHighScores = scores.slice(0, MAX_HIGH_SCORES);
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(newHighScores));
}

/**
 * Creates and manages the results view.
 *
 * @param {number} currentScore - The score achieved in the current game session.
 * @param {function} onPlayAgainCallback - Callback function when "Play Again" is clicked.
 * @returns {HTMLElement} The main div element of the results view.
 */
export function ResultView(currentScore, onPlayAgainCallback) {
    const view = document.createElement('div');
    view.className = 'result-view-container';

    const heading = document.createElement('h2');
    heading.textContent = 'Koniec Gry!';
    view.appendChild(heading);

    const currentScoreDisplay = document.createElement('p');
    currentScoreDisplay.className = 'current-score-display';
    currentScoreDisplay.innerHTML = `Twój wynik w tej sesji: <strong>${currentScore}</strong> punktów`;
    view.appendChild(currentScoreDisplay);

    // --- High Score Submission ---
    const highScores = getHighScores();
    const lowestHighScore = highScores.length < MAX_HIGH_SCORES ? 0 : highScores[highScores.length - 1].score;

    if (currentScore > lowestHighScore || highScores.length < MAX_HIGH_SCORES) {
        const nameInputLabel = document.createElement('label');
        nameInputLabel.textContent = 'Gratulacje! Wprowadź swoje imię, aby zapisać wynik:';
        nameInputLabel.htmlFor = 'playerNameInput';
        view.appendChild(nameInputLabel);

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'playerNameInput';
        nameInput.placeholder = 'Twoje imię';
        nameInput.maxLength = 15;
        view.appendChild(nameInput);

        const saveScoreButton = document.createElement('button');
        saveScoreButton.id = 'save-score-button';
        saveScoreButton.textContent = 'Zapisz Wynik';
        saveScoreButton.onclick = () => {
            const playerName = nameInput.value.trim() || 'Gracz';
            saveHighScore(playerName, currentScore);
            // Re-render leaderboard and disable input
            renderLeaderboard(view, leaderboardContainer); 
            nameInput.disabled = true;
            saveScoreButton.disabled = true;
            saveScoreButton.textContent = 'Wynik Zapisany!';
        };
        view.appendChild(saveScoreButton);
    }

    // --- Leaderboard Display ---
    const leaderboardContainer = document.createElement('div');
    leaderboardContainer.className = 'leaderboard';
    view.appendChild(leaderboardContainer);
    renderLeaderboard(view, leaderboardContainer); // Initial render

    // --- Play Again Button ---
    const playAgainButton = document.createElement('button');
    playAgainButton.id = 'play-again-button';
    playAgainButton.className = 'play-again-button';
    playAgainButton.textContent = 'Zagraj Ponownie';
    if (onPlayAgainCallback) {
        playAgainButton.addEventListener('click', onPlayAgainCallback);
    }
    view.appendChild(playAgainButton);

    return view;
}

/** Helper to render or re-render the leaderboard */
function renderLeaderboard(parentView, container) {
    container.innerHTML = ''; // Clear previous leaderboard
    const leaderboardTitle = document.createElement('h3');
    leaderboardTitle.textContent = 'Tabela Najlepszych Wyników';
    container.appendChild(leaderboardTitle);

    const highScores = getHighScores();
    if (highScores.length === 0) {
        const noScoresMsg = document.createElement('p');
        noScoresMsg.textContent = 'Brak zapisanych wyników. Bądź pierwszy!';
        container.appendChild(noScoresMsg);
    } else {
        const ol = document.createElement('ol');
        highScores.forEach(scoreEntry => {
            const li = document.createElement('li');
            li.textContent = `${scoreEntry.name}: ${scoreEntry.score} pkt`;
            ol.appendChild(li);
        });
        container.appendChild(ol);
    }
}

// --- Basic Test Area (Illustrative) ---
export function testResultView() {
    console.log("--- Test ResultView --- (Append to DOM to see)");
    localStorage.removeItem(HIGH_SCORES_KEY); // Clear previous test scores

    saveHighScore("Testowy Gracz 1", 100);
    saveHighScore("Testowy Gracz 2", 120);

    const mockOnPlayAgain = () => console.log("Play Again clicked!");
    
    const view1 = ResultView(80, mockOnPlayAgain); // Score doesn't make leaderboard initially
    const view2 = ResultView(150, mockOnPlayAgain); // Score makes leaderboard

    // To visually test, you'd append these to the DOM:
    // document.body.innerHTML = ''; // Clear body
    // document.body.appendChild(view1); 
    // or document.body.appendChild(view2);
    console.log("ResultView test function finished. Manually inspect by appending view1 or view2 to DOM.");
    console.log("Example: view1 will not ask for name, view2 will.");

    // Try saving a score through view2's interface and see localStorage update.
}

// To test:
// import { testResultView } from './components/ResultView.js';
// testResultView();
// Then, in browser, if you added an element like document.body.appendChild(view2), interact with it. 