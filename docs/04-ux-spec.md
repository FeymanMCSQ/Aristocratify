Aristocratify UX Specification
Product intent

Aristocratify should feel:

optional

lightweight

non-intrusive

reversible (mentally, if not literally undo)

It must never surprise the user.

UI elements
Floating action button

Label: 🧐 Aristocratify

Rendered only on WhatsApp Web

Exists exactly once in the DOM

Visibility rules

Hidden when:

composer is not found

composer draft is empty or whitespace

Visible when:

composer exists

composer contains text

controller state is READY

Positioning

Anchored visually to the composer

Typically above-right or near the top edge of the input box

Must reposition on:

window resize

scroll

composer rerender

If positioning fails (invalid rect), hide button.

Interaction behavior
On hover

Optional subtle hover affordance

No tooltips required for v1

On click

Button enters BUSY state:

disabled

label changes (e.g. “Rewriting…” or spinner)

Draft text is sent to API.

On success:

entire draft is replaced with rewritten text

cursor remains in composer

On failure:

draft remains unchanged

button returns to READY state

Busy state rules

While BUSY:

additional clicks are ignored

no parallel API calls

If the user edits the draft while BUSY:

rewritten output must not be applied

controller must abort replacement safely

Error handling (UX)

Errors must be silent by default.

Optional non-blocking toast allowed:

“Rewrite failed”

“Draft changed; rewrite not applied”

No modal dialogs.

No alerts.

Accessibility and restraint

Do not hijack focus unexpectedly.

Do not block normal WhatsApp keyboard shortcuts.

No sound, vibration, or aggressive animations.

Explicit non-goals (v1)

No auto-send

No rewrite-on-type

No chat history rewriting

No multiple style presets exposed in UI

No onboarding flow

UX success criteria

A user should be able to:

type normally

notice the button naturally

click it intentionally

understand the result instantly

continue typing or send as usual

No learning curve. No ceremony.