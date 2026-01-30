# Battlemat Next Architecture Plan

## Goals (from latest requirements)
- Single, universal editor for **any** element (rooms, doors, windows, objects, tokens, etc.).
- Simple placeholder rendering when a sprite is missing (solid square + label).
- Database-only state (no embedded/file sources).
- Cleaner HUD: remove redraw button, DPR/SS bubble, center/jump controls.
- One scene per POI (no scene selector).
- Wider zoom range: ~25% to ~400%.
- Preserve current design logic:
  - Rectangular rooms.
  - Base fog floor per building.
  - Layer rooms above the base.
- Standardize floor names: Ground, First Floor, Second Floor, Basement.

## Non‑Goals (for first pass)
- Feature changes beyond parity with current battlemat.
- New fog/LOS algorithms.
- New sprite art pipeline or shaders.

## Architectural Principles
1) **Single source of truth**: canonical state is the DB payload.
2) **Pure render**: rendering reads state only; it never mutates state.
3) **Explicit edits**: editor writes to canonical state via mutations.
4) **Deterministic save**: save writes exactly what you edited, no hidden transforms.

## Data Model (canonical)
- Battle/POI state is a single scene JSON.
- Campaign meta holds world entities (NPCs/PCs), battle scene holds rooms/openings/objects only.
- Floors are an array (not a map). Each floor has:
  - `id`, `name`, `rooms`, `openings`, `objects`
  - Standard names: `ground`, `first`, `second`, `basement` (configurable labels).
- Objects:
  - All interactive items are "objects" with `kind`, `hex`, `floorId`, `name?`, `sprite?`, `meta?`
- Openings:
  - Doors/windows/thresholds are opening objects with `kind`, `hex`, `orientation`, `openPct`, `seam_kind?`, `name?`

## State Flow (DB only)
1) Load: `GET /battles/:battle_id` → parse `state_json`.
2) Normalize: validate schema, fix missing IDs, ensure floor arrays exist.
3) Render: derive render lists (rooms/openings/objects/tokens) without mutation.
4) Edit: editor calls mutation helpers on the canonical state.
5) Save: `PUT /battles/:battle_id` with full `state_json` or a minimal patch.

## Rendering Pipeline
- Inputs: canonical state + view state (camera, zoom, floor).
- Steps:
  1) Compute floor bounds.
  2) Draw base floor (fog floor / background texture).
  3) Draw rooms and walls.
  4) Cut openings.
  5) Draw openings.
  6) Draw objects (sprites or placeholder squares with labels).
  7) Draw tokens (from campaign meta).
  8) Draw overlays (selection, hover, editor aids).
- No fallback sprites except the placeholder square + label.

## Editor Architecture (universal)
- Single selection model:
  - Selection = { type: "room|opening|object|token", id, floorId }
- One inspector panel:
  - Always renders fields for selected type.
  - Common fields: `id`, `name`, `hex`, `floorId`, `kind`, `notes`, `meta`.
- Tools:
  - Select / Move / Rotate / Scale / Place
  - Place mode chooses what to place: room, opening, object, token.
- All edits go through mutation helpers:
  - `updateRoom(id, patch)`, `updateOpening(id, patch)`, `updateObject(id, patch)`
- Edits immediately mark `dirty` and allow explicit save.

## UI/UX
- Remove: redraw button, DPR/SS bubble, center/jump.
- Keep: floor selector, POI selector, log, status, chat.
- Add: higher zoom range (25%–400%).
- Optional: quick "snap" toggles (grid snap on/off).

## Save Strategy
- Preferred: **full state save** (simpler, safer, fewer edge cases).
- Alternative: patch save (rooms/openings/objects only), if needed later.
- Each edit sets a dirty flag; autosave optional.

## Migration Strategy
- Start with battlemat_next.html.
- Implement:
  1) Canonical state loader (DB only).
  2) Minimal renderer (rooms/openings/objects + placeholders).
  3) Universal inspector.
  4) Save pipeline.
  5) Token rendering + campaign meta world entities.
- Parity checks after each phase.

## Open Questions (to resolve before build)
1) Save mode: full state vs patch?
2) Token editing: allow edit in this tool or read-only?
3) Floor naming: enforce fixed list or allow custom labels?
4) Object schema: do we standardize `name` / `meta` across all?

