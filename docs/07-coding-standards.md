Aristocratify Coding Standards

These rules exist to prevent “fast code rot.”

They are mandatory for both humans and AI IDEs.

File and module constraints

Max file length: 200 lines (soft), 300 lines (hard stop).

Max nesting depth: 3 levels.

One responsibility per module (enforced by architecture).

If a file grows too large, split it. Do not justify exceptions.

Naming conventions

Functions: verbNoun (e.g. findComposer, setDraftText)

Booleans: isX, hasX, canX

State enums: uppercase (READY, BUSY)

No clever abbreviations.

Comments: what and why
Required comments

Why a heuristic exists

Why a fallback exists

Why a deprecated API (e.g. execCommand) is used

Why a decision is conservative

Forbidden comments

Obvious restatements (“increment i”)

Apologies (“hacky but works”)

Future fantasies (“we could later…”)

Comment decisions, not mechanics.

Logging rules

Logging must be:

gated behind a DEBUG flag

never include message content

Allowed:

state transitions

lifecycle events

Forbidden:

raw input/output text

full API payloads

Error handling rules

Errors must be handled explicitly.

No empty catch blocks.

No throwing errors that bubble to the page.

If something fails:

fail closed

restore stable state

return control to the user

Imports and dependency discipline

controller may import from anywhere.

composer, ui, api must not import from each other.

No circular dependencies.

Violation = architectural bug.

“No cleverness” doctrine

The following are disallowed unless explicitly approved:

Introspecting WhatsApp internal JS objects

Monkey-patching native APIs

Regex-based DOM parsing

Diff-based text replacement

Prefer boring, brute-force, observable behavior.

Formatting

Consistent formatting enforced by formatter.

No mixed styles.

No commented-out dead code.