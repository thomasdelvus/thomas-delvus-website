# Battlemat3 Migration Status and Next Steps

Version: v1.01  
Updated: 2026-02-11

## Completed Milestones

1. Phase 0 baseline contract captured.
2. Phase 1 parity harness delivered.
3. Phase 2-6 behavior-preserving runtime extraction completed.
4. Phase 7 modular hardening completed for:
   1. contracts
   2. prefs
   3. API load helpers
   4. chat controller
   5. history/undo controller
   6. pan/zoom hold setup controller
5. Roof weathering workstream Phase 1-4 completed:
   1. state model normalization
   2. deterministic seeded render maps
   3. roof inspector controls
   4. cache/performance hardening

## Current Runtime Snapshot

1. `battlemat3.html` host is active and renders parity UI surface.
2. `main.js` remains primary orchestrator for render, tools, and mutations.
3. `modules/*` own extracted cross-cutting concerns.
4. Undo controls now route through history module with key-repeat guard.

## Known Constraints

1. Full-state save mode remains active by decision.
2. Changes to baseline behavior are only acceptable if user-visible behavior remains unchanged.
3. `src/docs/bak` is archival and excluded from compatibility decisions.

## Outstanding Validation

1. Full manual parity pass on active data sets.
2. Automated script execution requires Node environment availability.
3. Regression sweep for edge interactions:
   1. roof/room handle workflows
   2. token drag + entity patch
   3. chat poll/send under intermittent backend latency
4. Roof weathering visual QA:
   1. deterministic appearance under pan/zoom
   2. slider persistence across save/reload

## Recommended Next Work (Post-Docs)

1. Run full manual parity checklist from `src/docs2/09_testing_and_parity.md`.
2. Capture any remaining parity deltas as numbered defects.
3. Triage deltas into:
   1. must-fix before cutover
   2. acceptable parity-equivalent behavior
4. Produce cutover checklist:
   1. route readiness
   2. rollback path
   3. smoke tests

## Release Readiness Criteria

1. No blackout regressions across normal tool flows.
2. Save/chat/entity operations stable on production backend.
3. Undo behavior acceptable in both button and keyboard paths.
4. Stakeholder signoff after parity walkthrough.
