/**
 * Orchestration + state machine
 * Responsibilities: Own all state, decide when UI is visible, handle transformations.
 */

import * as composer from '../composer/index.js';
import * as ui from '../ui/index.js';
import * as api from '../api/index.js';

// Configuration & Standards
const DEBUG = true;

// Explicit States (docs/01-architecture.md)
export const STATES = {
    NO_COMPOSER: 'NO_COMPOSER',
    IDLE: 'IDLE',
    READY: 'READY',
    BUSY: 'BUSY'
};

let currentState = STATES.NO_COMPOSER;
let currentComposerHandle = null;
let unsubscribeDraft = null;

/**
 * Initializes the extension.
 */
export function init() {
    ui.mount();

    // Start observing WhatsApp DOM rerenders
    composer.refresh((handle) => {
        handleComposerChange(handle);
    });

    // Handle rewrite button clicks
    ui.onClick(() => {
        handleRewriteRequest();
    });

    if (DEBUG) console.log('[Aristocratify] Initialized');
}

/**
 * Core orchestration: Capture -> Rewrite -> Replace.
 * Strictly follows docs/00-constitution.md and docs/04-ux-spec.md.
 */
async function handleRewriteRequest() {
    if (currentState !== STATES.READY || !currentComposerHandle) return;

    const capturedHandle = currentComposerHandle;
    const originalText = composer.getDraftText(capturedHandle);
    const originalMetrics = {
        length: originalText.length,
        hash: originalText.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)
    };

    // 2. Transition to BUSY
    updateState(STATES.BUSY);

    try {
        // 3. Call API
        const rewrittenText = await api.rewrite(originalText, 'pompous_aristocratic_medieval_english');

        // 4. Validate user agency
        if (currentComposerHandle !== capturedHandle) {
            if (DEBUG) console.warn('[Aristocratify] Composer handle changed during rewrite; aborting.');
            return;
        }

        const currentText = composer.getDraftText(currentComposerHandle);
        const currentMetrics = {
            length: currentText.length,
            hash: currentText.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)
        };

        if (currentMetrics.length !== originalMetrics.length || currentMetrics.hash !== originalMetrics.hash) {
            if (DEBUG) console.warn('[Aristocratify] Draft changed during rewrite; aborting.');
            return;
        }

        // 5. Replace content (Atomic Clear + Paste)
        await composer.setDraftText(currentComposerHandle, rewrittenText);
        if (DEBUG) console.log('[Aristocratify] Rewrite applied successfully.');

    } catch (error) {
        if (DEBUG) console.error('[Aristocratify] Rewrite failed:', error);
    } finally {
        evaluateIdleReady();
    }
}

/**
 * Handles transition when the composer element changes.
 */
function handleComposerChange(handle) {
    if (unsubscribeDraft) {
        unsubscribeDraft();
        unsubscribeDraft = null;
    }

    currentComposerHandle = handle;

    if (!handle) {
        updateState(STATES.NO_COMPOSER);
        return;
    }

    // Subscribe to draft changes
    unsubscribeDraft = composer.subscribeDraftChanges(handle, () => {
        evaluateIdleReady();
    });

    evaluateIdleReady();
}

/**
 * Toggles state between IDLE and READY based on draft content.
 */
function evaluateIdleReady() {
    if (!currentComposerHandle) {
        updateState(STATES.NO_COMPOSER);
        return;
    }

    const text = composer.getDraftText(currentComposerHandle).trim();
    if (text.length > 0) {
        updateState(STATES.READY);
    } else {
        updateState(STATES.IDLE);
    }
}

/**
 * Primary state transition function.
 */
export function updateState(newState) {
    if (newState === currentState) return;
    if (DEBUG) console.log(`[Aristocratify] State Transition: ${currentState} -> ${newState}`);
    currentState = newState;
    syncUI();
}

/**
 * Synchronizes the UI state.
 */
function syncUI() {
    switch (currentState) {
        case STATES.NO_COMPOSER:
        case STATES.IDLE:
            ui.hide();
            break;

        case STATES.READY:
            ui.show();
            ui.setBusy(false);
            if (currentComposerHandle) {
                ui.position(composer.getAnchorRect(currentComposerHandle));
            }
            break;

        case STATES.BUSY:
            ui.show();
            ui.setBusy(true);
            break;
    }
}
