# Copilot / AI Agent Instructions for Aristocratify

Purpose: Help an AI coding agent be immediately productive in this repo by highlighting architecture, critical patterns, and developer workflows.

1) Big picture
- Frontend (Chrome extension): `loader.js` dynamically imports `main.js` -> calls `init()` in `controller/index.js`.
- Controller orchestrates: `composer` (DOM adapter) -> `api` (local backend client) -> `ui` (floating button).
- Backend: `server.js` runs an Express service that proxies requests to OpenRouter (Google Gemini). See `package.json` for deps.

2) Key invariants & flows
- Composer detection: see `composer/index.js`. It uses layered heuristics (visibility, bottom-half placement, aria-label) and must return null when ambiguous.
- Replacement flow (composer.setDraftText): atomic clear (keyboard simulation) -> 50ms settle -> simulated `ClipboardEvent` paste -> fallback `execCommand('insertText')`. This sequence is required to work with WhatsApp React/Lexical. See `composer/index.js` setDraftText.
- Controller safety: before applying a rewrite it verifies the composer handle and a simple hash/length to ensure user didn't modify the draft during rewrite. See `controller/index.js`.
- Fail-closed policy: on any API or concurrency error, the draft must not be changed; the controller catches and logs but does not apply partial changes.

3) API contract & networking
- Client: `api/index.js` POSTs to `http://localhost:3001/rewrite` with JSON {text, mode, ...opts}. It enforces a 10s timeout, and does at most 2 attempts (initial + 1 retry). Do not retry on 4xx. See `api/index.js` for exact retry/timeout behavior.
- Server: `server.js` forwards to OpenRouter (`https://openrouter.ai/api/v1/chat/completions`) and expects a response shape `data.choices[0].message.content`. It requires an `OPENROUTER_API_KEY` in `.env`. Server sends headers `HTTP-Referer` and `X-Title` (these are required by the provider integration).

4) Developer workflows (run & debug)
- Start backend (local):
  1. Create `.env` with `OPENROUTER_API_KEY=...`.
  2. Install deps: `npm install`.
  3. Run: `node server.js` (listens on `PORT` env or 3001).
- Load extension: open `chrome://extensions`, enable Developer mode, click "Load unpacked" and select the repo root.
- Logs: `controller/index.js` has `DEBUG = true` for verbose logs; flip to `false` for quieter runs.

5) Project-specific conventions
- Privacy: No message persistence; do not add disk writes for drafts. See README and `server.js` comments.
- Logging: Server has an invariant to avoid message logging in production (`docs/00-constitution.md`). Keep provider logs minimal and avoid including user messages in persistent logs.
- Error handling: Normalize provider/network errors and let the controller decide whether to surface or silently ignore (fail-closed). See `api/index.js` and `controller/index.js`.

6) Integration points to watch
- `composer.findComposer()` is fragile by nature — tests/changes to DOM heuristics must be validated on WhatsApp web.
- `composer.setDraftText()` uses `ClipboardEvent` and `document.execCommand`; browser security or future Chrome changes may break this. Keep this area small and well-instrumented.
- Provider interaction: `server.js` encodes the system prompt inline (see the `systemPrompt` constant); changes here change rewrite behavior immediately.

7) Files to inspect for context
- `server.js` (backend + OpenRouter integration)
- `api/index.js` (client-side timeout/retry and error normalization)
- `composer/index.js` (DOM heuristics + robust replacement)
- `controller/index.js` (state machine, orchestration, DEBUG flag)
- `ui/index.js` (floating button id: `aristocratify-button`)
- `README.md` and `docs/*.md` (design contracts and UX expectations)

8) Useful quick example
- Example client payload: `{ "text": "hello world", "mode": "pompous_aristocratic_medieval_english" }` -> POST `/rewrite` -> success response `{ "text": "Hark! ..." }`.

If any section is unclear or you want me to expand examples (e.g. exact test cases for `composer.findComposer()` or a minimal automated smoke test for the backend), tell me which part to iterate on.
