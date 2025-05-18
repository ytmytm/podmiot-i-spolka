const ONBOARDING_CONFIG_PATH = '/public/onboarding.json'; // Corrected path for Nginx serving
const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';

let onboardingConfig = null;
let currentStepIndex = 0;
let onboardingModalElement = null;
let onboardingTitleElement = null;
let onboardingTextElement = null;
let onboardingNextButtonElement = null;
let onboardingHighlightElement = null; // For highlighting specific elements

async function fetchOnboardingConfig() {
    if (onboardingConfig) return onboardingConfig;
    try {
        const response = await fetch(ONBOARDING_CONFIG_PATH);
        if (!response.ok) {
            // Log the full URL attempted for better debugging
            console.error(`Failed to fetch ${ONBOARDING_CONFIG_PATH}. Status: ${response.status} ${response.statusText}. Full URL: ${response.url}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        onboardingConfig = await response.json();
        return onboardingConfig;
    } catch (error) {
        console.error('Failed to load or parse onboarding configuration:', error);
        return null;
    }
}

function showStep(index) {
    if (!onboardingConfig || !onboardingConfig.onboardingSteps || index >= onboardingConfig.onboardingSteps.length) {
        finishOnboarding();
        return;
    }

    const step = onboardingConfig.onboardingSteps[index];
    currentStepIndex = index;

    if (onboardingTitleElement) onboardingTitleElement.textContent = step.title;
    if (onboardingTextElement) onboardingTextElement.innerHTML = step.text; // Use innerHTML if text can contain simple HTML
    if (onboardingNextButtonElement) onboardingNextButtonElement.textContent = step.buttonText || 'Dalej';

    // Clear previous highlight
    if (onboardingHighlightElement) {
        onboardingHighlightElement.classList.remove('onboarding-highlight');
        onboardingHighlightElement = null;
    }

    // Apply new highlight if targetElement or highlightElement is specified
    let elementToHighlight = null;
    if (step.highlightElement) {
        elementToHighlight = document.querySelector(step.highlightElement);
    }
    // Fallback to targetElement if highlightElement is not specified but targetElement is
    if (!elementToHighlight && step.targetElement) {
        elementToHighlight = document.querySelector(step.targetElement);
    }

    if (elementToHighlight) {
        onboardingHighlightElement = elementToHighlight;
        onboardingHighlightElement.classList.add('onboarding-highlight');
        // Optionally, scroll to the highlighted element
        // onboardingHighlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    if (onboardingModalElement) onboardingModalElement.style.display = 'block';
}

function nextStep() {
    showStep(currentStepIndex + 1);
}

function finishOnboarding() {
    if (onboardingModalElement) onboardingModalElement.style.display = 'none';
    if (onboardingHighlightElement) {
        onboardingHighlightElement.classList.remove('onboarding-highlight');
    }
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    console.log('Onboarding finished and marked as completed.');
}

function resetOnboardingState() {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    console.log('Onboarding state reset. It will show on next load if conditions met.');
}

async function initOnboarding() {
    const config = await fetchOnboardingConfig();
    if (!config || !config.onboardingSteps || config.onboardingSteps.length === 0) {
        console.log('No onboarding steps configured or failed to load config.');
        return;
    }

    // Get modal elements - these IDs will need to be in index.html
    onboardingModalElement = document.getElementById('onboarding-modal');
    onboardingTitleElement = document.getElementById('onboarding-title');
    onboardingTextElement = document.getElementById('onboarding-text');
    onboardingNextButtonElement = document.getElementById('onboarding-next-button');

    if (!onboardingModalElement || !onboardingTitleElement || !onboardingTextElement || !onboardingNextButtonElement) {
        console.error('Onboarding modal elements not found in the DOM. Onboarding cannot start.');
        return;
    }

    onboardingNextButtonElement.addEventListener('click', () => {
        if (currentStepIndex >= onboardingConfig.onboardingSteps.length - 1) {
            finishOnboarding();
        } else {
            nextStep();
        }
    });

    const isOnboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
    if (!isOnboardingCompleted) {
        console.log('Starting onboarding...');
        currentStepIndex = 0;
        showStep(currentStepIndex);
    } else {
        console.log('Onboarding already completed.');
    }
}

export { initOnboarding, resetOnboardingState }; 