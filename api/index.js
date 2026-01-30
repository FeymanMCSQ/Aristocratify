const API_BASE_URL = (() => {
    if (typeof window === 'undefined') return 'http://localhost:3001';
    if (window.__ARISTOCRATIFY_API_BASE__) return window.__ARISTOCRATIFY_API_BASE__;
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3001';
    }
    return 'https://aristocratify.onrender.com';
})();

/**
 * Rewrite client
 * Responsibilities: Call backend rewrite endpoint, enforce timeout, normalize errors.
 */

/**
 * Calls the backend rewrite service.
 * Strictly follows /docs/03-api-contract.md.
 * @param {string} text - The raw draft text.
 * @param {string} mode - The rewrite mode.
 * @param {object} opts - Optional parameters (intensity).
 * @returns {Promise<string>} The rewritten message.
 */
export async function rewrite(text, mode, opts = {}) {
    const payload = { text, mode, ...opts };
    const url = `${API_BASE_URL}/rewrite`;

    console.log(`[Aristocratify API] Starting rewrite request to: ${url}`);
    console.log(`[Aristocratify API] Payload metrics: length=${text.length}, mode=${mode}`);

    // Implementation of 10s timeout and retry logic
    let attempts = 0;
    const maxAttempts = 2; // Initial + 1 retry

    while (attempts < maxAttempts) {
        attempts++;
        console.log(`[Aristocratify API] Attempt ${attempts}/${maxAttempts}...`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.warn(`[Aristocratify API] Request timed out after 10s (Attempt ${attempts})`);
            controller.abort();
        }, 10000);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log(`[Aristocratify API] Response received. Status: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                // According to contract: Never retry on 4xx
                if (response.status >= 400 && response.status < 500) {
                    const errorData = await response.json();
                    console.error(`[Aristocratify API] 4xx Error:`, errorData);
                    throw new Error(errorData.error?.message || 'Invalid request');
                }
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log(`[Aristocratify API] Success! Rewritten text length: ${data.text?.length}`);
            return data.text;

        } catch (error) {
            clearTimeout(timeoutId);
            console.error(`[Aristocratify API] Attempt ${attempts} failed:`, error);

            const isRetryable = error.name === 'AbortError' || error.name === 'TypeError'; // Timeout or Network failure

            if (!isRetryable || attempts >= maxAttempts) {
                // Fail closed: return original text or rethrow normalized error
                // The contract says: treats any error as non-fatal and must not modify the composer draft.
                // The controller will handle the actual "do nothing" part, but we should reject here.
                console.error(`[Aristocratify API] Final failure after ${attempts} attempts.`);
                throw error;
            }

            // Basic wait before retry (optional but good practice)
            console.log(`[Aristocratify API] Retrying in 500ms...`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}
