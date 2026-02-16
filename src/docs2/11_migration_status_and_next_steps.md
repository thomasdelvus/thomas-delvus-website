# Battlemat3 Migration Status and Next Steps

Version: v1.03  
Updated: 2026-02-16

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
6. Movement and portal closeout completed:
   1. click-to-move pathing with wall/portal constraints
   2. destination snap-to-hex landing
   3. selected/hover/blocked movement hex cues
   4. blocked-path `Waiting for DM` messaging
   5. save-time opening normalization and locked-door default placement
   6. regression behavior contract automation

## Current Runtime Snapshot

1. `battlemat3.html` host is active and renders parity UI surface.
2. `main.js` remains primary orchestrator for render, tools, and mutations.
3. `modules/*` own extracted cross-cutting concerns.
4. Undo controls now route through history module with key-repeat guard.

## Stability Status

1. Movement/pathing subsystem status: `stable`.
2. Full manual `09_testing_and_parity` pass completed on 2026-02-16 with no additional movement regressions reported.
3. Automated parity and regression suite passing (`npm run test:battlemat3`).

## Known Constraints

1. Full-state save mode remains active by decision.
2. Changes to baseline behavior are only acceptable if user-visible behavior remains unchanged.
3. `src/docs/bak` is archival and excluded from compatibility decisions.

## Outstanding Validation

1. Regression sweep for edge interactions outside movement:
   1. roof/room handle workflows
   2. token drag + entity patch
   3. chat poll/send under intermittent backend latency
2. Roof weathering visual QA:
   1. deterministic appearance under pan/zoom
   2. slider persistence across save/reload
3. Portal interaction policy QA:
   1. blocked destinations in mixed door/gate layouts
   2. final DM/autonomy rule decisions for lockpick/forced entry flow

## Recommended Next Work (Post-Docs)

1. Treat movement as production-ready for regular gameplay use.
2. Capture only net-new gameplay defects from active play sessions.
3. Continue with autonomy/interaction policy work for:
   1. lockpicking / forced entry
   2. DM queue and deferred resolution behavior
4. Produce cutover checklist:
   1. route readiness
   2. rollback path
   3. smoke tests

## Release Readiness Criteria

1. No blackout regressions across normal tool flows.
2. Save/chat/entity operations stable on production backend.
3. Undo behavior acceptable in both button and keyboard paths.
4. Stakeholder signoff after parity walkthrough.
