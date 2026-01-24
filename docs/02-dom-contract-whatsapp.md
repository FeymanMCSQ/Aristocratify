WhatsApp Web DOM Contract (Aristocratify)

This document defines how Aristocratify interacts with WhatsApp Web safely. WhatsApp is a third-party app and its DOM is not stable. Aristocratify must assume rerenders and selector breakage are normal.

Target: the composer (draft input)

Aristocratify operates only on the message composer (the draft box where the user types), which is typically a contenteditable="true" element.

Non-targets (do not touch)

Chat history message nodes

Sidebar previews

Contact names, profile info

Send button

Any internal React state or private APIs

Composer discovery rules
Discovery approach (heuristic, layered)

Use a “primary + fallback” approach; never depend on a single brittle CSS class.

Primary heuristics (preferred):

Element has contenteditable="true"

Often has role="textbox" (but do not require it)

Visible and plausibly sized:

width > ~200px

height > ~20px

located in bottom portion of viewport (composer area)

Often has aria-label similar to “Type a message” (locale-dependent; treat as hint, not requirement)

Fallback heuristics:

Among all visible contenteditable="true" candidates, pick the one whose bounding rect is lowest on the page (largest rect.bottom), subject to minimum size thresholds.

Confidence rule

If multiple candidates exist and none is clearly the composer, do nothing:

hide Aristocratify UI

no API calls

keep observing until confidence improves

Rerender resilience

WhatsApp may replace the composer node on:

switching chats

opening attachments/stickers

layout changes

internal updates

Aristocratify must:

Use a MutationObserver on document.documentElement (subtree) to detect DOM changes.

Re-run composer discovery when changes occur.

If the composer handle changes, detach old listeners and attach new ones.

Reading text (contenteditable semantics)
Normalization

When reading the draft:

Prefer innerText (matches user-visible text better than textContent).

Normalize non-breaking spaces (\u00A0) to regular spaces.

Trim leading/trailing whitespace for “empty vs non-empty” checks.

Preserve internal newlines.

Empty detection

A draft is considered empty if, after normalization, it is whitespace only.

Writing text (safe replacement)
Goals

Replace the current draft with rewritten text.

Ensure WhatsApp registers the change (React/event listeners).

Preserve user focus in the composer.

Required behavior

Focus the composer.

Replace the entire content (select all → delete → insert text).

Dispatch an input-like event if necessary.

Implementation constraints

Prefer “user-like” operations that trigger native events:

focus

select all

delete

insert text

document.execCommand(...) is acceptable despite deprecation because it tends to integrate with contenteditable + frameworks. If unavailable, use a fallback:

set textContent / innerText + dispatch input event

No partial edits

Do not attempt diff-based patching. It increases risk and complexity. Full replacement only.

Change detection and UI triggering

Aristocratify may detect draft changes to decide whether to show the button.

Allowed listeners

input

keyup

paste

Use debouncing (e.g., 100–200ms) to avoid jitter.

Forbidden behavior

Do not call the rewrite API on these events.

Do not modify user draft on these events.

Button anchoring contract

The UI needs an anchor rect for positioning.

UI should position relative to the composer bounding rect.

UI must update on:

resize

scroll

composer rerender

If the rect is invalid (0 width/height), hide UI.

Known failure modes and required response
Composer not found

Response:

hide UI

keep observing

Composer found but write fails (WhatsApp ignores)

Response:

do not retry endlessly

return to READY state

draft remains unchanged

optionally show a small toast: “Rewrite failed”

API succeeds but draft changed while BUSY

This can happen if the user continues typing while request is in flight.

Policy:

Do not overwrite a draft that no longer matches the original request text.

Compare using a hash/length captured at click time.

If changed: abort applying result; return to READY; optionally toast: “Draft changed; rewrite not applied.”

Locale note

aria-label and placeholder text vary by language. Treat them as non-authoritative hints.

Anti-fragility checklist

Centralize heuristics/selectors in one place.

MutationObserver always on.

UI injection idempotent.

Fail closed: never guess aggressively.