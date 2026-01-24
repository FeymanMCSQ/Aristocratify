Aristocratify Test Plan

This document defines binary pass/fail criteria.
A feature either satisfies the test or it does not. There is no partial credit.

Test philosophy

Tests validate behavior, not implementation.

WhatsApp Web is treated as hostile and unstable.

Any ambiguity resolves to do nothing.

A. Composer detection tests
A1. Initial load

Steps

Load WhatsApp Web.

Open any chat.

Do not type anything.

Expected

No Aristocratify UI visible.

Fail if

Button appears without draft text.

A2. Draft presence

Steps

Click into the composer.

Type a short message (“hello”).

Expected

Aristocratify button appears within 200ms.

Button appears only once.

Fail if

Button does not appear.

Multiple buttons appear.

A3. Draft cleared

Steps

With text present, delete all text.

Expected

Aristocratify button disappears.

Fail if

Button remains visible.

A4. Chat switching

Steps

Type text in chat A.

Switch to chat B.

Type text in chat B.

Expected

Button follows the active composer.

No leftover UI in previous chat.

Exactly one button exists.

Fail if

Button duplicates.

Button anchors to wrong chat.

Button disappears permanently.

B. Rewrite behavior tests
B1. Basic rewrite

Steps

Type a sentence.

Click Aristocratify.

Expected

One API call is made.

Draft text is replaced with rewritten text.

Cursor remains in composer.

Fail if

Draft is appended instead of replaced.

Cursor focus is lost.

Multiple API calls occur.

B2. Emoji + URL preservation

Input

Check this out 😂 https://example.com


Expected

Emojis preserved.

URL preserved verbatim.

Meaning preserved.

Fail if

Emojis removed.

URL altered.

Extra content added.

B3. Multiline input

Steps

Enter a multiline message (Shift+Enter).

Rewrite.

Expected

Newlines preserved.

Entire draft rewritten.

Fail if

Lines collapse.

Partial rewrite occurs.

C. Failure handling tests
C1. API timeout

Setup

Simulate API delay > timeout.

Expected

Draft text remains unchanged.

Button returns to READY state.

Fail if

Draft cleared or modified.

UI becomes stuck BUSY.

C2. API error (500 / invalid response)

Expected

Draft untouched.

No crash.

Optional toast allowed.

Fail if

Draft overwritten.

Extension errors visibly.

C3. Draft modified while BUSY

Steps

Type text.

Click Aristocratify.

While BUSY, type more characters.

Expected

Rewrite result is NOT applied.

User’s latest text remains.

UI returns to READY.

Fail if

Rewrite overwrites newer text.

D. Stability tests
D1. Page refresh

Steps

Refresh WhatsApp Web.

Type text.

Expected

Button appears normally.

D2. Window resize / scroll

Expected

Button repositions correctly.

No jitter or duplication.

E. Security and privacy tests
E1. Client-side logging

Expected

No raw draft text appears in console logs.

E2. Bundle inspection

Expected

No API keys present in extension files.

Test verdict

A release passes only if all tests pass.
Any single failure blocks release.