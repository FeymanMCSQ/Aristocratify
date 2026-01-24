/**
 * Floating button UI
 * Responsibilities: Render button, show/hide, position, handle clicks.
 */

const BUTTON_ID = 'aristocratify-button';

/**
 * Creates and appends the Aristocratify button to the DOM if it doesn't exist.
 * Idempotent.
 */
/**
 * Positions the button relative to the composer.
 * Strictly follows /docs/04-ux-spec.md.
 * @param {DOMRect|null} rect - The bounding rect of the composer.
 */
export function position(rect) {
    const btn = document.getElementById(BUTTON_ID);
    if (!btn) return;

    if (!rect || rect.width === 0 || rect.height === 0) {
        hide();
        return;
    }

    // Positioning logic: Anchored above-right near the top edge of the input box
    // Using fixed coordinates relative to the composer's viewport position
    const buttonRect = btn.getBoundingClientRect();

    const top = rect.top - buttonRect.height - 8; // 8px gap above
    const left = rect.right - buttonRect.width;    // Aligned to right edge

    Object.assign(btn.style, {
        top: `${Math.max(8, top)}px`, // Ensure it doesn't go off the top of the viewport
        left: `${Math.max(8, left)}px` // Ensure it doesn't go off the left of the viewport
    });
}

/**
 * Sets the button to a busy state (disabled + loading indicator).
 * Strictly follows /docs/04-ux-spec.md.
 * @param {boolean} isBusy - Whether the button should show as busy.
 */
export function setBusy(isBusy) {
    const btn = document.getElementById(BUTTON_ID);
    if (!btn) return;

    if (isBusy) {
        btn.disabled = true;
        btn.innerText = '⏳ Rewriting...';
        btn.style.opacity = '0.7';
        btn.style.cursor = 'not-allowed';
    } else {
        btn.disabled = false;
        btn.innerText = '🧐 Aristocratify';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
}

export function mount() {
    if (document.getElementById(BUTTON_ID)) return;

    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.innerText = '🧐 Aristocratify';

    // Base styles as specified in UX spec (floating, fixed, hidden initially)
    Object.assign(btn.style, {
        position: 'fixed',
        zIndex: '9999',
        display: 'none', // Hidden when: composer is not found or draft is empty
        padding: '8px 12px',
        backgroundColor: '#075E54', // WhatsApp-like green
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        transition: 'opacity 0.2s'
    });

    document.body.appendChild(btn);
}

/**
 * Shows the button.
 */
export function show() {
    const btn = document.getElementById(BUTTON_ID);
    if (btn) btn.style.display = 'block';
}

/**
 * Hides the button.
 */
export function hide() {
    const btn = document.getElementById(BUTTON_ID);
    if (btn) btn.style.display = 'none';
}

/**
 * Attaches a click handler to the button.
 * @param {Function} handler - The function to call on click.
 */
export function onClick(handler) {
    const btn = document.getElementById(BUTTON_ID);
    if (btn) {
        btn.onclick = (e) => {
            e.preventDefault();
            handler();
        };
    }
}
