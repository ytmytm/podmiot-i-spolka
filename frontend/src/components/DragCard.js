/**
 * Creates a draggable card element for a part of speech.
 * @param {string} partOfSpeech - The type of part of speech (e.g., 'Podmiot', 'Orzeczenie').
 * @param {string} label - The display text for the card (can be the same as partOfSpeech or a more user-friendly version).
 * @returns {HTMLElement} The draggable card element.
 */
export function DragCard(partOfSpeech, label) {
  const card = document.createElement('div');
  card.className = 'drag-card';
  card.textContent = label || partOfSpeech;
  card.draggable = true;
  card.dataset.partOfSpeech = partOfSpeech;

  // Add an ID for easier testing/selection if needed, e.g., based on partOfSpeech
  card.id = `drag-card-${partOfSpeech.toLowerCase().replace(/\s+/g, '-')}`;

  // Optional: Add visual feedback on drag start (though this is often handled in CSS or by drag.js)
  // card.addEventListener('dragstart', () => {
  //   card.classList.add('dragging');
  // });
  // card.addEventListener('dragend', () => {
  //  card.classList.remove('dragging');
  // });

  return card;
}

// Basic test (can be moved to a separate test file)
export function testDragCard() {
  const podmiotCard = DragCard('Podmiot', 'Podmiot');
  console.assert(podmiotCard.draggable === true, 'Test Failed: Card not draggable');
  console.assert(podmiotCard.dataset.partOfSpeech === 'Podmiot', 'Test Failed: data-part-of-speech incorrect');
  console.assert(podmiotCard.textContent === 'Podmiot', 'Test Failed: textContent incorrect');
  console.assert(podmiotCard.classList.contains('drag-card'), 'Test Failed: drag-card class missing');
  console.log('DragCard basic tests passed.');

  const orzeczenieCard = DragCard('Orzeczenie');
  console.assert(orzeczenieCard.dataset.partOfSpeech === 'Orzeczenie', 'Test Failed: data-part-of-speech incorrect for Orzeczenie');
  console.assert(orzeczenieCard.textContent === 'Orzeczenie', 'Test Failed: textContent incorrect for Orzeczenie (default label)');
  console.log('DragCard tests with default label passed.');

  // You would typically append these to the DOM to make them visible and interactable
  // document.body.appendChild(podmiotCard);
  // document.body.appendChild(orzeczenieCard);
}

// Example of how to run the test
// testDragCard(); 