# Battlemat3 Testing and Parity Guide

Version: v1.05  
Updated: 2026-02-16

## Testing Strategy

Use two layers:

1. Contract automation for fast regression checks.
2. Manual interaction validation for behavior and rendering parity.

## Latest Result

1. Full checklist execution reported complete on 2026-02-16.
2. No additional movement/pathing issues reported after final gate, snap, and render-order fixes.
3. Current movement status is `stable` pending only net-new defects from live play.

## Automated Contract Checks

Scripts:

1. `src/test/battlemat3/parity_dom_contract.mjs`
2. `src/test/battlemat3/parity_runtime_contract.mjs`
3. `src/test/battlemat3/regression_behavior_contract.mjs`
4. `src/test/battlemat3/run.mjs`

Command:

1. `npm run test:battlemat3`

Validation focus:

1. DOM ID set parity
2. button label order parity
3. script wiring path
4. localStorage key usage parity
5. query parameter usage parity
6. fetch call-site parity
7. required PUT/PATCH/chat signatures
8. movement cadence and destination snap contracts
9. default locked-door placement contract
10. blocked-path cue/message contract
11. save-time opening normalization contract
12. movement geometry cache contract
13. pathfinding latency status cue contract
14. chat polling in-flight/queued guard contract
15. chat polling warning throttle contract

## Manual Parity Matrix

Run these on each meaningful change set:

1. load `/play3/{battle_id}`
2. verify all tools can select/create/edit/delete as expected
3. drag operations:
   1. token
   2. object
   3. opening
   4. room and roof handles
4. keyboard:
   1. undo
   2. delete/backspace in and out of inputs
   3. escape poly cancel
5. save:
   1. make changes
   2. click Save
   3. confirm persistence after reload
6. chat:
   1. send message
   2. confirm polling updates
   3. while polling is active, send again and confirm no duplicate burst or repeated warning spam
7. fog/street/roof:
   1. toggle controls
   2. verify expected visibility behavior
8. preferences:
   1. change toggles
   2. reload
   3. confirm persistence
9. roof weathering (Phase 3):
   1. select a roof and adjust `Aging/Moss/Mottling/Streaks/Repairs/Contrast`
   2. verify deterministic look after pan/zoom
   3. verify persistence after Save + reload
   4. verify `Reset Weather` returns the roof to baseline weathering
10. roof weathering perf (Phase 4):
   1. pan across map with multiple weathered roofs visible
   2. confirm no stutter spike after first render warm-up
   3. confirm no blackout/errors in console
11. movement UX pass:
   1. select token in play mode and confirm yellow start hex highlight
   2. hover map and confirm blue destination preview hex
   3. click destination and confirm yellow anchor jumps to planned stop
   4. confirm token lands centered on target hex
   5. verify tokens remain drawn above doors/windows on token layer
12. blocked path pass:
   1. click to an unreachable destination behind locked gate/door
   2. confirm token walks to closest reachable approach point
   3. confirm red blocked cue pulse and `Waiting for DM` status message
   4. confirm half-row blocked stops choose side by approach direction:
      1. from south -> lower numbered hex
      2. from north -> higher numbered hex
13. opening persistence pass:
   1. place new door and confirm initial state is `locked`
   2. save and reload
   3. confirm `kind/state/openPct/orientation/floorId` persisted
14. pathfinding latency cue pass:
   1. trigger a long route search
   2. confirm temporary `Pathfinding... <ms>` status appears when solve time exceeds threshold

## Micro-Batch Validation Pattern

For risky refactors:

1. apply one micro-batch
2. hard refresh
3. run fast smoke tests
4. continue only if no blackout/errors
5. rollback immediately on regression

## Required Environment

1. Node.js available for automated scripts.
2. Browser with devtools for runtime checks.
3. Backend endpoints reachable for integration tests.

If Node is unavailable, rely on manual parity checks and direct grep-based signature checks.
