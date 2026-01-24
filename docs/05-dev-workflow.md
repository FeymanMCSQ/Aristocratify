Aristocratify Development Workflow
Local development setup
Extension

Build extension assets (if needed).

Open Chrome / Chromium:

chrome://extensions

Enable Developer Mode

Load unpacked extension directory

Open https://web.whatsapp.com

Backend

Run the rewrite API locally:

node server.js


or equivalent.

Default dev endpoint: http://localhost:3001/rewrite

CORS must allow extension origin during dev.

Environment configuration
Required config values

API base URL

Debug flag (boolean)

These must be:

centralized

easy to switch between dev/prod

not scattered across files

Debugging rules
Allowed debug output

lifecycle events (composer found, rerender detected)

state transitions (READY → BUSY → READY)

API timing (duration, success/failure)

Forbidden debug output

raw draft text

rewritten output text

full request payloads

If text-related debugging is needed:

log character count

log hash only

Typical dev loop

Load WhatsApp Web.

Type text in composer.

Verify button appears.

Click Aristocratify.

Verify:

API call fires once

draft is replaced or preserved correctly

Switch chats.

Verify:

no duplicate button

button reappears when typing

Regression checklist (run before release)

Refresh WhatsApp → extension still works

Switch chats rapidly → no UI duplication

Resize window → button repositions

Long text → rewrite still applied

Emojis + URLs → preserved

API down → draft untouched

Release hygiene

Increment version

Disable debug mode

Confirm no secrets bundled

Confirm no console logs of user content

Re-run regression checklist

Mental model for contributors (human or AI)

WhatsApp DOM is hostile and unstable.

The extension must be calm, conservative, and boring.

If uncertain, do nothing.