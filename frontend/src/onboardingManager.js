const ONBOARDING_CONFIG_PATH = '/public/onboarding.json'; // Corrected path for Nginx serving
const ONBOARDING_COMPLETED_KEY = 'onboardingCompleted';

let onboardingConfig = null;
let currentStepIndex = 0;
let onboardingModalElement = null;
let onboardingTitleElement = null;
let onboardingTextElement = null;
let onboardingNextButtonElement = null;
let onboardingHighlightElement = null; // For highlighting specific elements

// --- Tooltip specific variables ---
let tooltipElement = null;

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
    initTooltips(); // Initialize tooltips after onboarding is finished
}

function resetOnboardingState() {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    console.log('Onboarding state reset. It will show on next load if conditions met.');
}

// --- Tooltip Functions ---
function createTooltipElement() {
    if (tooltipElement) return;
    tooltipElement = document.createElement('div');
    tooltipElement.id = 'dynamic-tooltip';
    tooltipElement.style.display = 'none';
    document.body.appendChild(tooltipElement);
}

function showTooltip(targetElement, text, position = 'top') {
    if (!tooltipElement) createTooltipElement();
    if (!tooltipElement || !targetElement) return;

    tooltipElement.textContent = text;
    tooltipElement.style.display = 'block';

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();

    let top, left;

    switch (position) {
        case 'bottom':
            top = targetRect.bottom + 8 + window.scrollY;
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2) + window.scrollX;
            break;
        case 'left':
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2) + window.scrollY;
            left = targetRect.left - tooltipRect.width - 8 + window.scrollX;
            break;
        case 'right':
            top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2) + window.scrollY;
            left = targetRect.right + 8 + window.scrollX;
            break;
        case 'top':
        default:
            top = targetRect.top - tooltipRect.height - 8 + window.scrollY;
            left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2) + window.scrollX;
            break;
    }
    // Ensure tooltip stays within viewport (basic boundary detection)
    if (left < 0) left = 8;
    if (left + tooltipRect.width > window.innerWidth) left = window.innerWidth - tooltipRect.width - 8;
    if (top < 0) top = 8; 
    // No check for bottom overflow here, can be added if needed

    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
}

function hideTooltip() {
    if (tooltipElement) {
        tooltipElement.style.display = 'none';
    }
}

function initTooltips() {
    if (!onboardingConfig || !onboardingConfig.tooltips || onboardingConfig.tooltips.length === 0) {
        console.log('No tooltips configured.');
        return;
    }
    createTooltipElement(); // Ensure the tooltip div exists

    onboardingConfig.tooltips.forEach(tooltipData => {
        // For dynamic elements, we need to use event delegation or re-attach if DOM changes significantly.
        // For simplicity, this will attach to elements present at init time.
        // If elements are added later (like .word-slot), this needs a more robust solution (e.g. MutationObserver or delegated events).
        const targets = document.querySelectorAll(tooltipData.targetElement);
        
        targets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                showTooltip(target, tooltipData.text, tooltipData.position);
            });
            target.addEventListener('mouseleave', hideTooltip);
            // For focusable elements like buttons, you might also want focus/blur
            // target.addEventListener('focus', () => showTooltip(target, tooltipData.text, tooltipData.position));
            // target.addEventListener('blur', hideTooltip);
        });
    });
    console.log('Tooltips initialized.');
}

async function initOnboarding() {
    const config = await fetchOnboardingConfig();
    if (!config || !config.onboardingSteps || config.onboardingSteps.length === 0) {
        console.log('No onboarding steps configured or failed to load config.');
        // Still try to init tooltips if onboarding steps are missing but tooltips might exist
        if (config && config.tooltips) initTooltips(); 
        return;
    }

    // Get modal elements - these IDs will need to be in index.html
    onboardingModalElement = document.getElementById('onboarding-modal');
    onboardingTitleElement = document.getElementById('onboarding-title');
    onboardingTextElement = document.getElementById('onboarding-text');
    onboardingNextButtonElement = document.getElementById('onboarding-next-button');

    if (!onboardingModalElement || !onboardingTitleElement || !onboardingTextElement || !onboardingNextButtonElement) {
        console.error('Onboarding modal elements not found in the DOM. Onboarding cannot start.');
        // Try to init tooltips even if modal parts are missing
        if (config.tooltips) initTooltips();
        return;
    }

    onboardingNextButtonElement.addEventListener('click', () => {
        if (currentStepIndex >= onboardingConfig.onboardingSteps.length - 1) {
            finishOnboarding(); // This will now call initTooltips
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
        console.log('Onboarding already completed. Initializing tooltips.');
        initTooltips(); // Initialize tooltips if onboarding was already done
    }
}

export { initOnboarding, resetOnboardingState }; 