/**
 * Loader for Aristocratify
 * Since MV3 doesn't support 'type: module' for content scripts directly,
 * we use dynamic import to load our modular system.
 */
(async () => {
    try {
        const src = chrome.runtime.getURL('main.js');
        await import(src);
    } catch (e) {
        console.error('[Aristocratify] Failed to load extension:', e);
    }
})();
