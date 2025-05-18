/**
 * Creates and manages the sentence board display.
 * @param {object} sentenceData - The sentence data object.
 * @param {string} sentenceData.sentence - The full sentence string.
 * @param {Array<object>} sentenceData.tokens - Array of token objects.
 * @param {string} sentenceData.tokens[].word - The word(s) for this token.
 * @param {string} sentenceData.tokens[].part - The grammatical part (unused by this component directly but available).
 * @param {function} onSlotClickCallback - Callback function when a word slot is clicked.
 *                                        It receives (tokenWord, tokenIndex).
 * @returns {HTMLElement} The main div element of the sentence board.
 */
export function SentenceBoard(sentenceData, onSlotClickCallback) {
  const board = document.createElement('div');
  board.className = 'sentence-board';

  // Optionally, display the full sentence as a reference
  // const sentenceDisplay = document.createElement('p');
  // sentenceDisplay.className = 'full-sentence-display';
  // sentenceDisplay.textContent = sentenceData.sentence;
  // board.appendChild(sentenceDisplay);

  const slotsContainer = document.createElement('div');
  slotsContainer.className = 'word-slots-container';

  sentenceData.tokens.forEach((token, index) => {
    const slot = document.createElement('span'); // Or 'div'
    slot.className = 'word-slot';
    slot.textContent = token.word;
    slot.dataset.tokenIndex = index;

    // Add an ID for easier testing/selection if needed
    slot.id = `word-slot-${index}`;

    if (onSlotClickCallback) {
      slot.addEventListener('click', () => {
        onSlotClickCallback(token.word, index);
      });
    }
    slotsContainer.appendChild(slot);
  });

  board.appendChild(slotsContainer);
  return board;
}

// Basic test (can be moved to a separate test file)
export function testSentenceBoard() {
  const mockSentenceData = {
    id: 1,
    sentence: "Ala ma kota.",
    level: 1,
    tokens: [
      {word: "Ala", part: "Podmiot"},
      {word: "ma", part: "Orzeczenie"},
      {word: "kota", part: "Dopełnienie"} // Example token
    ]
  };

  let clickedToken = null;
  let clickedIndex = -1;

  const mockCallback = (tokenWord, tokenIndex) => {
    console.log(`Clicked: ${tokenWord}, index: ${tokenIndex}`);
    clickedToken = tokenWord;
    clickedIndex = tokenIndex;
  };

  const boardElement = SentenceBoard(mockSentenceData, mockCallback);

  // Simulate a click for testing
  const firstSlot = boardElement.querySelector('#word-slot-0');
  if (firstSlot) {
    firstSlot.click();
    console.assert(clickedToken === "Ala", "Test Failed: Clicked token word mismatch");
    console.assert(clickedIndex === 0, "Test Failed: Clicked token index mismatch");
    console.log("SentenceBoard basic click test passed.");
  } else {
    console.error("Test Failed: Could not find first slot for click test.");
  }

  // Check if board is created
  console.assert(boardElement.classList.contains('sentence-board'), "Test Failed: Board class missing");
  console.assert(boardElement.querySelectorAll('.word-slot').length === 3, "Test Failed: Incorrect number of word slots");
  console.log("SentenceBoard rendering tests passed.");

  // You would typically append boardElement to the DOM to see it
  // document.body.appendChild(boardElement);
}

// Example of how to run the test if this file is executed directly (e.g. via <script type=module>)
// testSentenceBoard(); 