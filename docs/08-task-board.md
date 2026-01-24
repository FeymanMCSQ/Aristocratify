Aristocratify Task Board

This document defines how work is executed.
Tasks are small, sequential, and verifiable.

Task execution rules

One task at a time.

Each task must have:

clear scope

acceptance criteria

No task may violate the constitution.

Phase 1 — Skeleton (no WhatsApp logic)
Task 1.1 — Repo scaffolding

Goal

Create folder structure:

/composer

/ui

/api

/controller

/docs

Acceptance

Files exist.

No logic implemented.

Imports wired but empty.

Phase 2 — Composer adapter
Task 2.1 — Composer discovery

Goal

Implement findComposer() with heuristics.

Acceptance

Returns correct element in common cases.

Returns null when uncertain.

No UI injected yet.

Task 2.2 — Draft read/write

Goal

Implement getDraftText() and setDraftText().

Acceptance

Text replaces cleanly.

WhatsApp registers the change.

No partial edits.

Task 2.3 — Rerender resilience

Goal

MutationObserver-based re-acquisition.

Acceptance

Switching chats preserves functionality.

No duplicate listeners.

Phase 3 — UI
Task 3.1 — Button mount

Goal

Render exactly one floating button.

Acceptance

No duplicates under any navigation.

Task 3.2 — Positioning

Goal

Anchor button to composer rect.

Acceptance

Repositions on resize/scroll.

Task 3.3 — Busy state

Goal

Disabled + visual feedback during rewrite.

Phase 4 — API client
Task 4.1 — Rewrite client

Goal

Implement POST /rewrite.

Acceptance

Timeout enforced.

Errors normalized.

Phase 5 — Controller integration
Task 5.1 — State machine

Goal

Implement explicit states.

Acceptance

All transitions documented and logged (debug).

Task 5.2 — Rewrite orchestration

Goal

Click → BUSY → replace → READY.

Acceptance

All tests in section B/C pass.

Phase 6 — Hardening
Task 6.1 — Edge cases

Draft changes mid-request

Composer disappears mid-request

Task 6.2 — Regression pass

Run full /docs/06-test-plan.md.

Completion criteria

Aristocratify is complete when:

All tasks are marked complete

All tests pass

Constitution remains unviolated