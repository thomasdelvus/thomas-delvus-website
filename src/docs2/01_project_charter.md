# Battlemat3 Project Charter

Version: v1.00  
Updated: 2026-02-10

## Mission

Deliver `battlemat3` as a maintainable refactor of `battlemat_next` with no user-visible capability loss.

## Scope

1. Refactor runtime into modular ES modules.
2. Preserve existing tools, controls, data contracts, and interaction behavior.
3. Keep full-state save mode active during development.
4. Keep `public/app/battlemat_next.html` unchanged.

## Locked Decisions

1. Full-state saves remain the active mode.
2. Fixes are allowed if user-visible behavior is unchanged.
3. `src/docs/bak` is archival only and not compatibility authority.

## Non-Goals

1. No new gameplay/editor features.
2. No API schema redesign.
3. No migration of historical docs in `src/docs/bak`.
4. No replacement of existing backend endpoints.

## Success Criteria

1. UI/control parity with battlemat_next.
2. API contract parity (battle save, chat, entity patch).
3. Keyboard/mouse parity for editing and navigation.
4. Local preference parity for all existing keys.
5. No critical regressions in manual parity matrix.

## Guardrails

1. When behavior is ambiguous, baseline runtime behavior wins over design intent.
2. Refactors must preserve request shapes and endpoint usage.
3. High-risk changes should be micro-batched and user-tested incrementally.
4. If a parity regression is suspected, rollback to last passing micro-batch.

## Deliverables

1. `public/app/battlemat3.html` host page.
2. `public/app/battlemat3/main.js` runtime.
3. `public/app/battlemat3/modules/*` extracted controllers.
4. `src/test/battlemat3/*` parity checks.
5. This `src/docs2/*` operational and architectural documentation set.

