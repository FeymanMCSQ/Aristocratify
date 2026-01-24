/**
 * Floating button UI
 * Responsibilities: Render button, show/hide, position, handle clicks.
 */

const BUTTON_ID = 'aristocratify-button';

/**
 * Positions the button relative to the composer.
 * @param {DOMRect|null} rect - The bounding rect of the composer.
 */
export function position(rect) {
    const btn = document.getElementById(BUTTON_ID);
    if (!btn) return;

    if (!rect || rect.width === 0 || rect.height === 0) {
        hide();
        return;
    }

    const buttonRect = btn.getBoundingClientRect();
    const top = rect.top - buttonRect.height - 8;

    Object.assign(btn.style, {
        top: `${Math.max(8, top)}px`,
        left: `${Math.max(8, rect.right - buttonRect.width)}px`
    });
}

/**
 * Sets the button to a busy state.
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

    Object.assign(btn.style, {
        position: 'fixed',
        zIndex: '9999',
        display: 'none',
        padding: '8px 12px',
        color: 'white',
        backgroundColor: '#075E54',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        transition: 'opacity 0.2s',
        fontFamily: 'sans-serif'
    });

    document.body.appendChild(btn);
}

export function show() {
    const btn = document.getElementById(BUTTON_ID);
    if (btn) btn.style.display = 'block';
}

export function hide() {
    const btn = document.getElementById(BUTTON_ID);
    if (btn) btn.style.display = 'none';
}

export function onClick(handler) {
    const btn = document.getElementById(BUTTON_ID);
    if (btn) {
        btn.onclick = (e) => {
            e.preventDefault();
            handler();
        };
    }
}
