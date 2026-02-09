# Battlemat3 Phase 1 Harness

Version: v1.00  
Date: 2026-02-09

## Purpose

Provide automated parity checks that do not require browser framework dependencies.

## Scripts

1. `src/test/battlemat3/parity_dom_contract.mjs`
   1. compares ID sets between `battlemat_next.html` and `battlemat3.html`
   2. compares button label order
   3. checks script wiring to `/app/battlemat3/main.js`
2. `src/test/battlemat3/parity_runtime_contract.mjs`
   1. compares localStorage key usage sets
   2. compares query parameter usage sets
   3. compares fetch call-site signatures
   4. checks for required save/chat/entity contract signatures
3. `src/test/battlemat3/run.mjs`
   1. executes both scripts
   2. exits non-zero if any parity check fails

## Command

1. `npm run test:battlemat3`

## Notes

1. This harness validates contract parity only.
2. Visual parity and interactive behavior still require manual testing.

