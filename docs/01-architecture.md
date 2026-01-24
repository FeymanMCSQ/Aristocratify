Aristocratify Architecture
High-level shape

Aristocratify is a small, modular MV3 extension with a single core flow:

Composer draft → Controller → Rewrite API → Controller → Composer draft

UI is a thin layer that reflects controller state (READY/BUSY) and triggers a rewrite action.

Module boundaries (hard)

Keep the codebase split into four areas. Each area has one reason to change.

1) composer/ — WhatsApp composer adapter

Responsibilities:

Find the message composer element reliably.

Read current draft text.

Replace draft text safely (contenteditable semantics).

Subscribe to changes (input/keyup/paste + DOM rerender detection).

Must not:

Call the network.

Style UI.

Decide when to rewrite.

Exports (conceptual):

findComposer(): ComposerHandle | null

subscribeDraftChanges(handle, cb): Unsubscribe

getDraftText(handle): string

setDraftText(handle, text): void

getAnchorRect(handle): DOMRect (for UI positioning)

refresh(): void (re-acquire composer after rerenders)

2) ui/ — Floating button UI

Responsibilities:

Render exactly one button (idempotent mount).

Show/hide based on controller state.

Position near composer anchor rect.

Show busy state (disabled + spinner/label).

Must not:

Read the draft text directly (no DOM spelunking here).

Call the network.

Know WhatsApp details besides anchor rect.

Exports (conceptual):

mount(): void

show(): void

hide(): void

setBusy(isBusy: boolean): void

position(rect: DOMRect): void

onClick(handler): void

3) api/ — Rewrite client

Responsibilities:

Call your backend rewrite endpoint.

Enforce timeout.

Normalize errors.

Return a single rewritten string.

Must not:

Touch DOM.

Store secrets.

Log message content.

Exports (conceptual):

rewrite(text: string, mode: string, opts?): Promise<string>

4) controller/ — Orchestration + state machine

Responsibilities:

Own all state.

Decide when UI is visible.

Handle click → rewrite → replace.

Enforce constitution invariants.

Handle failures safely (no overwrites).

Must not:

Contain selectors.

Contain UI styling.

Contain provider-specific API logic.

Dependency direction (no cycles)

controller imports composer, ui, api

composer imports nothing from ui or api

ui imports nothing from composer or api

api imports nothing from others

State machine

Controller state is explicit, not implicit.

States:

NO_COMPOSER — composer not found or unstable → UI hidden, no actions.

IDLE — composer exists, draft is empty/whitespace → UI hidden.

READY — composer exists, draft non-empty → UI visible, clickable.

BUSY — rewrite in progress → UI visible (or optional), disabled, shows busy indicator.

Transitions:

NO_COMPOSER ↔ IDLE/READY when composer appears/disappears.

IDLE ↔ READY when draft becomes empty/non-empty.

READY → BUSY on user click/hotkey.

BUSY → READY on success (draft replaced) or failure (draft unchanged) depending on current draft.

Key rule:

BUSY must be exclusive. While BUSY, ignore additional clicks.

Data rules

Only the draft text is read.

The controller does not persist draft text.

If you need to compare “did the draft change while busy”, store only:

a short hash of the original text (or length + hash)

never store raw text in persistent storage

Error-handling contract

Any API failure results in:

no change to composer text

UI returns to READY (or IDLE if draft became empty)

optional non-invasive toast (no modal)

Configuration

API base URL is configurable (dev/prod).

“Mode” or “intensity” are optional settings, stored in extension storage (non-sensitive).

Release stability goal

Assume WhatsApp DOM changes frequently. The system survives by:

centralizing DOM heuristics in composer/

using MutationObserver to re-acquire composer

making UI injection idempotent