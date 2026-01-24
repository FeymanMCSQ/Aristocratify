/**
 * WhatsApp composer adapter
 * Responsibilities: Find composer, read/write draft text, subscribe to changes.
 */

/**
 * Finds the WhatsApp message composer using layered heuristics.
 * Strictly follows /docs/02-dom-contract-whatsapp.md.
 * @returns {HTMLElement|null} The composer element or null if not found or ambiguous.
 */
export function findComposer() {
    const candidates = Array.from(document.querySelectorAll('[contenteditable="true"]'));

    if (candidates.length === 0) {
        return null;
    }

    // Filter by visibility and plausibility
    const plausible = candidates.filter(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const isVisible = rect.width > 200 &&
            rect.height > 20 &&
            style.visibility !== 'hidden' &&
            style.display !== 'none';

        // Check if located in bottom portion of viewport (approximate)
        const isInBottomHalf = rect.bottom > (window.innerHeight / 2);

        return isVisible && isInBottomHalf;
    });

    if (plausible.length === 0) {
        return null;
    }

    // Primary heuristic: role="textbox" and/or "Type a message" hint
    const primary = plausible.filter(el => {
        const role = el.getAttribute('role');
        const ariaLabel = el.getAttribute('aria-label') || '';
        // Locale-dependent hint (English "Type a message" or generic detection)
        const isLikelyLabel = /Type a message/i.test(ariaLabel);

        return role === 'textbox' || isLikelyLabel;
    });

    if (primary.length === 1) {
        return primary[0];
    }

    // Fallback: pick the lowest element on the page (largest rect.bottom)
    const sortedByBottom = [...plausible].sort((a, b) => {
        return b.getBoundingClientRect().bottom - a.getBoundingClientRect().bottom;
    });

    const lowest = sortedByBottom[0];
    const secondLowest = sortedByBottom[1];

    // Confidence rule: If the lowest is significantly lower than the second lowest,
    // or if there's only one plausible candidate, we are confident.
    if (plausible.length === 1) {
        return plausible[0];
    }

    if (secondLowest && (lowest.getBoundingClientRect().bottom - secondLowest.getBoundingClientRect().bottom) > 50) {
        return lowest;
    }

    // Fail closed: If multiple candidates exist and none is clearly the composer, do nothing.
    // This adheres to the "Confidence rule" in /docs/02-dom-contract-whatsapp.md.
    return null;
}

/**
 * Subscribes to draft changes (input, keyup, paste).
 * Strictly follows /docs/02-dom-contract-whatsapp.md.
 * @param {HTMLElement} handle - The composer element.
 * @param {Function} cb - The callback to trigger on change.
 * @returns {Function} An unsubscribe function.
 */
export function subscribeDraftChanges(handle, cb) {
    if (!handle) return () => { };

    let timeout = null;
    const debouncedCb = () => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => cb(), 150); // 100-200ms debounce as per contract
    };

    const events = ['input', 'keyup', 'paste'];
    events.forEach(evt => handle.addEventListener(evt, debouncedCb));

    return () => {
        if (timeout) clearTimeout(timeout);
        events.forEach(evt => handle.removeEventListener(evt, debouncedCb));
    };
}

/**
 * Reads the current draft text from the composer.
 * Strictly follows /docs/02-dom-contract-whatsapp.md.
 * @param {HTMLElement} handle - The composer element.
 * @returns {string} The normalized draft text.
 */
export function getDraftText(handle) {
    if (!handle) return '';

    // Prefer innerText as it matches user-visible text better
    let text = handle.innerText || '';

    // Normalize non-breaking spaces to regular spaces
    text = text.replace(/\u00A0/g, ' ');

    return text;
}

/**
 * Replaces the entire content of the composer with the given text.
 * Strictly follows /docs/02-dom-contract-whatsapp.md.
 * @param {HTMLElement} handle - The composer element.
 * @param {string} text - The text to insert.
 */
export function setDraftText(handle, text) {
    if (!handle) {
        console.error('[Aristocratify] setDraftText called without handle.');
        return;
    }

    console.log(`[Aristocratify] Starting replacement (V3: Simulated Paste). Target length: ${text.length}`);

    try {
        handle.focus();

        // 1. CLEAR: selectAll + delete
        const selection = window.getSelection();
        selection.removeAllRanges();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        console.log('[Aristocratify] V3 Step 1: Editor cleared.');

        // 2. PASTE SIMULATION
        // This is the most reliable way to update complex framework states like Lexical/React
        const dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', text);

        const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: dataTransfer,
            bubbles: true,
            cancelable: true,
            composed: true
        });

        const handled = handle.dispatchEvent(pasteEvent);
        console.log(`[Aristocratify] V3 Step 2: Paste event dispatched. Handled: ${handled}`);

        // 3. FALLBACK: insertText
        // Some frameworks block 'paste' events; we follow up with insertText if the paste didn't finish the job
        const currentVal = handle.innerText || handle.textContent || '';
        if (currentVal.trim().length === 0) {
            console.log('[Aristocratify] V3 Step 3: Paste ignored, using insertText...');
            document.execCommand('insertText', false, text);
        }

        // 4. SYNC: Final input event
        // Ensure framework sees a generic input change
        handle.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            composed: true,
            inputType: 'insertText'
        }));

    } catch (e) {
        console.warn('[Aristocratify] V3 Strategy failed, using direct DOM fallback:', e);
        handle.innerHTML = '';
        handle.innerText = text;
        handle.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Ensure cursor at end
    try {
        const finalSelection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(handle);
        range.collapse(false);
        finalSelection.removeAllRanges();
        finalSelection.addRange(range);
    } catch (err) { }
}

/**
 * Gets the bounding rect of the composer for UI positioning.
 * @param {HTMLElement} handle - The composer element.
 * @returns {DOMRect|null} The rect or null if invalid.
 */
export function getAnchorRect(handle) {
    if (!handle) return null;
    const rect = handle.getBoundingClientRect();
    // If height or width is 0, the element is likely not visible or detached
    if (rect.width === 0 || rect.height === 0) return null;
    return rect;
}

let observer = null;
let lastHandle = null;

/**
 * Starts observing DOM changes to re-acquire the composer.
 * Strictly follows /docs/02-dom-contract-whatsapp.md.
 * @param {Function} onComposerChange - Callback triggered when composer handle changes.
 */
export function refresh(onComposerChange) {
    if (observer) observer.disconnect();

    observer = new MutationObserver(() => {
        const currentHandle = findComposer();
        if (currentHandle !== lastHandle) {
            lastHandle = currentHandle;
            onComposerChange(currentHandle);
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // Initial check
    const initialHandle = findComposer();
    lastHandle = initialHandle;
    onComposerChange(initialHandle);
}
