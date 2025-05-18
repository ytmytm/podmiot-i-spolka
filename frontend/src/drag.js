/**
 * Initializes drag and drop functionality.
 *
 * @param {string} draggableSelector - CSS selector for draggable elements (e.g., '.drag-card').
 * @param {string} droppableSelector - CSS selector for droppable elements (e.g., '.word-slot').
 * @param {function} onDropCallback - Callback function executed on successful drop.
 *                                    Receives (draggedData, dropTargetData).
 *                                    - draggedData: The 'data-part-of-speech' from the dragged card.
 *                                    - dropTargetData: The 'data-token-index' from the word slot.
 */
export function initializeDragAndDrop(draggableSelector, droppableSelector, onDropCallback) {
  const draggables = document.querySelectorAll(draggableSelector);
  const droppables = document.querySelectorAll(droppableSelector);

  let draggedElement = null; // To store the element being dragged

  draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', (event) => {
      draggedElement = event.target; // Store the dragged element
      // Check if dataset.partOfSpeech exists before trying to set it
      if (event.target.dataset && event.target.dataset.partOfSpeech) {
        event.dataTransfer.setData('text/plain', event.target.dataset.partOfSpeech);
      } else {
        // Fallback or error if the data attribute is missing
        event.dataTransfer.setData('text/plain', 'unknown'); // Or handle error
        console.warn("Drag started on element without 'data-part-of-speech':", event.target);
      }
      event.target.classList.add('dragging'); // Visual cue
      // console.log('Drag Start:', event.target.dataset.partOfSpeech);
    });

    draggable.addEventListener('dragend', (event) => {
      event.target.classList.remove('dragging');
      draggedElement = null; // Clear the stored element
      // console.log('Drag End');
    });
  });

  droppables.forEach(droppable => {
    droppable.addEventListener('dragover', (event) => {
      event.preventDefault(); // Necessary to allow dropping
      droppable.classList.add('drag-over'); // Visual cue for potential drop target
      // console.log('Drag Over:', droppable);
    });

    droppable.addEventListener('dragleave', (event) => {
      // Check if the mouse is leaving the droppable element itself or a child
      if (event.target === droppable && !droppable.contains(event.relatedTarget)) {
        droppable.classList.remove('drag-over');
      }
      // A simpler approach if not dealing with complex nested elements:
      // droppable.classList.remove('drag-over');
      // console.log('Drag Leave:', droppable);
    });

    droppable.addEventListener('drop', (event) => {
      event.preventDefault();
      droppable.classList.remove('drag-over');
      const partOfSpeech = event.dataTransfer.getData('text/plain');
      const tokenIndex = event.target.dataset.tokenIndex; // From word-slot

      // console.log(`Dropped: ${partOfSpeech} onto token index: ${tokenIndex}`);

      if (onDropCallback && partOfSpeech && tokenIndex !== undefined) {
        onDropCallback(partOfSpeech, tokenIndex, draggedElement, event.target);
      } else {
        console.warn('Drop occurred but callback not executed. Data:', { partOfSpeech, tokenIndex });
      }
      draggedElement = null; // Clear after drop
    });
  });
}

// --- Basic Test Area ---
// This would typically be in a separate test file and use a test runner.
export function testDragAndDrop() {
  // 0. Clean up any previous test elements
  const existingTestContainer = document.getElementById('test-drag-drop-container');
  if (existingTestContainer) {
    existingTestContainer.remove();
  }

  // 1. Setup mock DOM elements
  const container = document.createElement('div');
  container.id = 'test-drag-drop-container';
  document.body.appendChild(container);

  const partsTray = document.createElement('div');
  partsTray.id = 'parts-tray';
  container.appendChild(partsTray);

  const sentenceBoard = document.createElement('div');
  sentenceBoard.id = 'sentence-board-test';
  container.appendChild(sentenceBoard);


  // Create a draggable card
  const draggableCard = document.createElement('div');
  draggableCard.className = 'test-drag-card'; // Use a specific class for test
  draggableCard.textContent = 'Podmiot';
  draggableCard.draggable = true;
  draggableCard.dataset.partOfSpeech = 'Podmiot';
  draggableCard.id = 'test-draggable';
  partsTray.appendChild(draggableCard);

  // Create a droppable slot
  const droppableSlot = document.createElement('span');
  droppableSlot.className = 'test-word-slot'; // Use a specific class for test
  droppableSlot.textContent = 'Słowo1';
  droppableSlot.dataset.tokenIndex = '0';
  droppableSlot.id = 'test-droppable';
  sentenceBoard.appendChild(droppableSlot);

  // 2. Define a mock callback
  let dropOccurred = false;
  let receivedPartOfSpeech = '';
  let receivedTokenIndex = '';
  let receivedDraggedEl = null;
  let receivedDroppedOnEl = null;

  const mockDropCallback = (partOfSpeech, tokenIndex, draggedEl, droppedOnEl) => {
    console.log(`Mock Drop Callback: Part of Speech='${partOfSpeech}', Token Index='${tokenIndex}'`);
    console.log("Dragged Element:", draggedEl);
    console.log("Dropped on Element:", droppedOnEl);
    dropOccurred = true;
    receivedPartOfSpeech = partOfSpeech;
    receivedTokenIndex = tokenIndex;
    receivedDraggedEl = draggedEl;
    receivedDroppedOnEl = droppedOnEl;
  };

  // 3. Initialize drag and drop for the test elements
  initializeDragAndDrop('.test-drag-card', '.test-word-slot', mockDropCallback);

  // 4. Simulate drag and drop (programmatic simulation is complex and often not perfect)
  // For a true test, manual interaction or a library like Playwright/Cypress is better.
  // Here's a very basic attempt to trigger events for illustrative purposes:

  console.log("--- Starting Drag and Drop Test Simulation ---");
  console.log("To test, manually drag 'Podmiot' card onto 'Słowo1'.");
  console.log("You should see console logs from the callback and assertions below after a manual drag and drop.");


  // Programmatic event dispatching for drag and drop is notoriously tricky
  // and might not fully replicate browser behavior.
  // A more robust test would involve UI testing tools.

  // Example: Simulate a drop (this often doesn't work as expected without a real drag operation)
  const dragStartEvent = new DragEvent('dragstart', { bubbles: true, dataTransfer: new DataTransfer() });
  draggableCard.dispatchEvent(dragStartEvent);
  if (dragStartEvent.dataTransfer) {
      dragStartEvent.dataTransfer.setData('text/plain', 'Podmiot');
  }

  const dragOverEvent = new DragEvent('dragover', { bubbles: true, cancelable: true });
  droppableSlot.dispatchEvent(dragOverEvent);

  const dropEvent = new DragEvent('drop', { bubbles: true, dataTransfer: dragStartEvent.dataTransfer });
  droppableSlot.dispatchEvent(dropEvent);


  // 5. Assertions (will likely fail with purely programmatic dispatch as above)
  // These assertions are more meaningful after a *manual* drag and drop.
  // We'll log them for now.

  setTimeout(() => { // Wait for events to potentially process
    console.log("--- Test Assertions (run after manual drag & drop) ---");
    if (dropOccurred) {
        console.log("Drop Occurred: PASSED");
        console.assert(receivedPartOfSpeech === 'Podmiot', `Test Failed: Part of speech. Expected 'Podmiot', got '${receivedPartOfSpeech}'`);
        console.assert(receivedTokenIndex === '0', `Test Failed: Token index. Expected '0', got '${receivedTokenIndex}'`);
        console.assert(receivedDraggedEl && receivedDraggedEl.id === 'test-draggable', `Test Failed: Dragged element mismatch.`);
        console.assert(receivedDroppedOnEl && receivedDroppedOnEl.id === 'test-droppable', `Test Failed: Dropped on element mismatch.`);
        if (receivedPartOfSpeech === 'Podmiot' && receivedTokenIndex === '0') {
            console.log("Data correctness: PASSED");
        } else {
            console.error("Data correctness: FAILED");
        }
    } else {
        console.error("Drop Occurred: FAILED - Drop event was not successfully processed by the callback.");
        console.log("Note: Programmatic drag and drop simulation is unreliable. Please test manually by dragging the card.");
    }
    console.log("Drag and drop test function finished. Check console for results.");
    // Optional: remove test elements
    // container.remove();
  }, 100); // Timeout to allow manual drag if programmatic fails
}

// To run the test:
// 1. Make sure you have some basic CSS for .dragging and .drag-over for visual feedback.
//    Example:
//    <style>
//      .test-drag-card { border: 1px solid blue; padding: 5px; margin: 5px; display: inline-block; cursor: grab; }
//      .test-word-slot { border: 1px solid green; padding: 10px; margin: 5px; display: inline-block; min-width: 50px; text-align: center; }
//      .dragging { opacity: 0.5; border: 2px dashed red; }
//      .drag-over { background-color: lightyellow; border-style: dashed; }
//      #test-drag-drop-container { margin-top: 20px; padding: 10px; border: 1px solid #ccc; }
//    </style>
// 2. Call testDragAndDrop() in your main JS file or browser console after importing it.
// e.g. import { testDragAndDrop } from './drag.js'; testDragAndDrop(); 