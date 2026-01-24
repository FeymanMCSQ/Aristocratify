Aristocratify API Contract
Purpose

Define a strict boundary between the browser extension and the AI rewrite service so that:

the AI provider can be swapped without touching extension logic

no secrets leak into client code

failures are predictable and safe

This contract is provider-agnostic.

Endpoint
POST /rewrite

This is the only API endpoint the extension may call.

Request schema
{
  "text": "string",
  "mode": "string",
  "intensity": "number (optional)"
}

Field definitions

text (required)

The full draft message as typed by the user.

UTF-8 string.

May include emojis, URLs, newlines, slang, or mixed casing.

mode (required)

A symbolic instruction for rewrite style.

Initial supported value:

"pompous_aristocratic_medieval_english"

Must be treated as declarative, not procedural.

intensity (optional)

Range: 0.0 – 1.0

Controls how heavy the aristocratic tone is.

If omitted, backend must choose a sensible default.

The extension does not assume its presence.

Response schema (success)
{
  "text": "string"
}

Success guarantees

text is a rewritten version of the input.

Meaning must be preserved.

URLs, emojis, numbers, and proper nouns must remain intact.

Output must be only the rewritten message (no commentary, no quotes).

Response schema (error)
{
  "error": {
    "code": "string",
    "message": "string"
  }
}

Error codes (suggested, not exhaustive)

INVALID_INPUT

TIMEOUT

RATE_LIMITED

PROVIDER_ERROR

INTERNAL_ERROR

The extension must treat any error as non-fatal and must not modify the composer draft.

Transport and timing rules

Timeout: 10 seconds max

Retry policy:

0 or 1 retry maximum

Retry only on network failure or timeout

Never retry on 4xx responses

Response size must be bounded (no essays)

Privacy and logging rules (backend)

Do not log raw text by default.

If logging is required for debugging:

log only text length and a short hash

logging must be opt-in and disabled in prod

No long-term storage of user messages.

Prompt contract (backend responsibility)

The backend must enforce a strict prompt similar to:

Rewrite the user’s message into pompous aristocratic medieval English.
Preserve meaning, names, emojis, URLs, and structure.
Do not add facts.
Keep length similar unless explicitly instructed.
Output only the rewritten message.

The extension must never embed prompt logic itself.

Stability guarantee

As long as this contract holds, the extension code must not change when:

switching AI models

switching providers

adjusting prompt wording