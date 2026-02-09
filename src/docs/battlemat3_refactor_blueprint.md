# Battlemat3 Refactor Blueprint

Version: v1.00  
Date: 2026-02-09  
Scope: Ground-up refactor to `public/app/battlemat3.html` with behavior parity to `public/app/battlemat_next.html`.

## Locked Decisions

1. Full-state saves remain current development mode.
2. Fixes are allowed only when user-visible behavior is unchanged.
3. `src/docs/bak` is archival only and out of compatibility scope.

## Primary Goal

Ship a new battlemat implementation with identical user-visible behavior, menu/tool capability parity, and existing API contract parity, while improving maintainability and runtime efficiency.

## Non-Goals

1. No feature expansion.
2. No schema migration.
3. No change to save mode (still full-state save).
4. No change to existing `battlemat_next.html`.

## Current Behavior Contract (Must Preserve)

### URL/Auth/Load Contract

1. Battle id query fallbacks: `battle_id`, `battleId`, `id`.
2. Auth token query fallbacks: `token`, `auth`, `bearer`.
3. Local dev state override on localhost: `dev_state`, `state_url`.
4. Load sequence:
   1. battle (`/api/battles/:id`)
   2. campaign (`/api/campaigns/:id`)
   3. map options (`/api/battles?campaign_id=...` fallback to campaign meta).

### Save Contract

1. Manual save button triggers PUT to `/api/battles/:battle_id`.
2. Payload uses full state (`state_json`) with wrapper preservation (`records` + `active.recordId`) when present.
3. Internal keys removed from persisted state (`_battle_id`, `_campaign_id`).

### Entity/Token Contract

1. Token rendering comes from `campaign.meta_json.world.entities` filtered by current POI.
2. Token edits persist via `PATCH /api/campaigns/:campaign_id/entities`.
3. Token create/delete/update behavior remains incremental through entity patch endpoint.

### Chat Contract

1. Poll `/api/messages` every 3 seconds with `campaign_id`, `since_ts`, `limit`.
2. Send chat via `POST /api/messages`.
3. Status rendering and merge behavior remain identical.

### UI/Interaction Contract

1. Same tools and top-level controls: Select, Poly, Roof, Opening, Object, Token.
2. Same layer selector behavior and draw order.
3. Same inspector field set for each selected entity type.
4. Same keyboard behavior:
   1. `Ctrl/Cmd+Z`: Undo
   2. `Delete/Backspace`: Delete selected (except focused input)
   3. `Escape`: cancel in-progress poly
   4. `Control` hold: handle hot mode.
5. Same mouse drag semantics for token/object/opening/poly/roof handles.

### Local Preference Contract

Persist and restore the same localStorage keys:

1. `bm_hexgrid`
2. `bm_bright_labels`
3. `bm_handles`
4. `bm_fog`
5. `bm_hide_roofs`
6. `bm_street_view`
7. `bm_roof_line_color`
8. `bm_roof_line_width`
9. `bm_video`
10. `bm_poly_alpha`
11. `bm_backdrop`
12. `bm_section_*` collapse states

## Target Architecture

Create `public/app/battlemat3.html` as a thin host with modular JS under `public/app/battlemat3/`.

### Suggested File Layout

1. `public/app/battlemat3.html`
2. `public/app/battlemat3/main.js`
3. `public/app/battlemat3/dom.js`
4. `public/app/battlemat3/constants.js`
5. `public/app/battlemat3/state/store.js`
6. `public/app/battlemat3/state/adapters.js`
7. `public/app/battlemat3/state/history.js`
8. `public/app/battlemat3/api/battles.js`
9. `public/app/battlemat3/api/campaigns.js`
10. `public/app/battlemat3/api/messages.js`
11. `public/app/battlemat3/render/renderer.js`
12. `public/app/battlemat3/render/layers.js`
13. `public/app/battlemat3/render/textures.js`
14. `public/app/battlemat3/render/sprites.js`
15. `public/app/battlemat3/geometry/hex.js`
16. `public/app/battlemat3/geometry/polygon.js`
17. `public/app/battlemat3/tools/selection.js`
18. `public/app/battlemat3/tools/drag.js`
19. `public/app/battlemat3/tools/create.js`
20. `public/app/battlemat3/inspector/schema.js`
21. `public/app/battlemat3/inspector/render.js`
22. `public/app/battlemat3/inspector/apply.js`
23. `public/app/battlemat3/chat/controller.js`
24. `public/app/battlemat3/status/controller.js`
25. `public/app/battlemat3/entities/sync.js`

### Architectural Rules

1. Pure renderer: no state mutation inside render path.
2. Single mutation gateway: all edits flow through typed mutation helpers.
3. Adapter boundary: normalize all schema variants on load, denormalize only at save boundary.
4. Centralized side effects: API calls and timers are isolated from geometry/render code.

## Efficiency Improvements Allowed Under Parity

1. Render scheduler:
   1. replace direct repeated render calls with `requestAnimationFrame` invalidation queue.
   2. deduplicate same-tick render triggers.
2. Canvas sizing:
   1. recalc backing sizes only on resize/DPR change/video quality change.
3. Geometry memoization:
   1. cache wall segments and room polygons per floor revision.
   2. invalidate cache only on relevant mutation.
4. Event simplification:
   1. remove duplicated drag-hit logic via shared helpers.
5. Inspector schema-driven render:
   1. eliminate repetitive DOM field assembly code while preserving exact field behavior.

## Phased Delivery Plan

### Phase 0: Baseline Lock

Deliverables:

1. Freeze parity baseline checklist from `battlemat_next.html`.
2. Capture canonical fixtures:
   1. `src/docs/JSON_CrossKeys.JSON`
   2. `src/docs/JSON_SaffrondaleStreets.JSON`.

Exit criteria:

1. Every user-visible control/interaction is enumerated.

### Phase 1: Parity Harness

Deliverables:

1. Add automated parity harness (Playwright or equivalent):
   1. deterministic mocked API responses
   2. event-sequence tests
   3. network payload snapshot tests
   4. image diff tests for key scenes.

Exit criteria:

1. Harness passes against `battlemat_next.html`.

### Phase 2: Shell + Core State

Deliverables:

1. `battlemat3.html` host page with matching DOM ids and controls.
2. Modular state store and adapters.
3. Load and normalize battle/campaign data.

Exit criteria:

1. Read-only page loads and renders initial view without interaction regressions.

### Phase 3: Rendering Port

Deliverables:

1. Port layer renderer, textures, sprites, fog, roofs, cutouts, tokens.
2. Preserve draw ordering and visibility rules.

Exit criteria:

1. Visual diff within tolerance on fixture scenes.

### Phase 4: Interaction Port

Deliverables:

1. Tool switching, selection, drag, placement, keyboard shortcuts.
2. Pan/zoom hold behavior and wheel zoom behavior.

Exit criteria:

1. Interaction parity suite passes.

### Phase 5: Inspector + Mutations

Deliverables:

1. Full inspector parity by selected type.
2. Reorder/delete/move semantics.
3. Undo stack parity.

Exit criteria:

1. Mutation/network snapshots match baseline behavior.

### Phase 6: Persistence + Chat + Entity Sync

Deliverables:

1. Save button full-state PUT parity.
2. Chat polling/send parity.
3. Entity patch queue parity.

Exit criteria:

1. API contract suite passes against mocked worker behavior.

### Phase 7: Hardening + Cutover Readiness

Deliverables:

1. Performance comparison report.
2. Bug triage against parity failures.
3. Feature flag or side-by-side launch plan.

Exit criteria:

1. `battlemat3` passes all parity gates with no critical regressions.

## Parity Test Matrix (Minimum)

1. Load flows:
   1. direct battle load
   2. wrapped state load (`records`/`active`)
   3. localhost dev state load.
2. Tooling:
   1. create/select/edit/delete room/opening/object/token/roof.
3. Drag:
   1. token/object/opening drag
   2. room poly point/edge/center drag
   3. roof spine and line visibility toggles.
4. Fog/street view:
   1. room visibility classing
   2. explored updates
   3. opening/object/token fog behavior.
5. Save/undo:
   1. undo after each entity mutation class
   2. save payload equivalence.
6. Chat/status:
   1. message merge/update
   2. initiative/status panel values.
7. Preferences:
   1. all keys persisted and restored.

## Definition of Done

1. `public/app/battlemat_next.html` unchanged.
2. `public/app/battlemat3.html` implements full parity contract.
3. Full-state save mode preserved.
4. No user-visible capability loss.
5. Automated parity suite green.
6. Performance not worse than baseline; targeted improvements achieved in drag/render-heavy paths.

## Open Implementation Notes

1. Keep docs as guidance, but runtime behavior of `battlemat_next.html` is canonical for parity.
2. Treat `src/docs/bak` as non-authoritative historical reference.
3. Any behavior ambiguity resolves in favor of observed current UI behavior.
