Aristocratify Constitution
Purpose

Aristocratify is a browser extension for WhatsApp Web that rewrites the current draft message (composer input) into pompous aristocratic medieval English only when the user explicitly triggers it.

Non-negotiable invariants
I. User agency

No auto-send. Ever. Aristocratify must not click “Send”, trigger Enter, or otherwise dispatch a message.

No automatic rewriting. The extension may detect draft presence to show UI, but it must not call the AI or modify the draft unless the user clicks the button or uses a hotkey.

Failure must not destroy user work. If rewrite fails, the original draft must remain unchanged.

II. Data privacy and security

No API keys in the extension. No provider keys shipped in content scripts, bundled code, or extension storage.

No message logging in production. No console logs, analytics, or backend logs that include raw draft text. Debug mode may exist but must never log raw message contents; at most log length + hashes.

Minimize data scope. Only read the WhatsApp composer draft text. Do not scrape chat history, contact names, or other page content.

III. Robustness and maintainability

Selectors are centralized and documented. DOM selectors and heuristics live in exactly one module/file with explanations and fallbacks.

Idempotent injection. UI injection must never create duplicates. Re-renders must reattach cleanly.

Fail closed. If the composer cannot be identified confidently, do nothing (hide UI, no API calls).

Definition of Done (binary)

A build is “done” only if all items pass:

Button appears when the composer contains non-whitespace text.

Clicking the button sends the composer text to the rewrite API and replaces the composer content with the rewritten version.

Emojis and URLs are preserved (not removed, not mangled).

No duplicate button after switching chats, resizing, or WhatsApp rerenders.

If the API fails, times out, or returns invalid output: composer text remains unchanged.

No keys embedded in extension.

No raw message content is logged client-side or server-side.

Forbidden moves (instant rejection)

Putting OpenAI/AI provider keys in the extension.

Calling the AI API on keystroke / on input change (except a future explicitly approved “preview mode” behind a toggle).

Programmatically sending messages.

Reliance on WhatsApp internal JS/React objects or private APIs.

Scattering DOM selectors across multiple files.

Writing everything in one “easy” mega-file.

Performance and cost guardrails

API calls happen only on explicit trigger.

Timeouts are enforced (default 10 seconds).

Optional: basic retry policy (max 1 retry) only for network errors, never for 4xx.

Change policy

Any change that violates an invariant requires explicit revision of this constitution first. No “just this once” exceptions.