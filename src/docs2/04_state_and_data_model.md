# Battlemat3 State and Data Model

Version: v1.00  
Updated: 2026-02-10

## Runtime State Containers

Primary in-memory containers in `public/app/battlemat3/main.js`:

1. `STATE`
   1. `battle`
   2. `campaign`
   3. `entities`
   4. optional wrapper context: `wrapper`, `recordId`
2. `VIEW`
   1. camera hex/world center
   2. zoom
   3. active `floorId`
3. `UI`
   1. render/presentation toggles and visual preferences
4. `EDITOR`
   1. active tool and selection
   2. transient poly and drag state
   3. dirty marker
5. `HISTORY`
   1. undo snapshots
   2. stack index and limit
6. `CHAT`
   1. merged rows
   2. id map
   3. polling cursor and timer
7. `BACKDROP`
   1. background asset metadata
   2. position/rotation/scale

## Battle State Normalization

Performed by `normalizeState()` in `modules/api.js`.

1. Ensures floor array exists.
2. Normalizes each floor:
   1. `id`
   2. `rooms`
   3. `openings`
   4. `objects`
   5. `roofs`
3. Rebuilds roof spine metadata (`updateRoofSpine` callback).
4. Backfills object `floorId` where missing.

## Wrapper Record Support

State can arrive in two forms:

1. Scene object directly.
2. Wrapped record form:
   1. `records`
   2. `active.recordId`

`extractScene()` handles both and preserves wrapper context so save can round-trip without structural loss.

## Token Data Model

Tokens are rendered from campaign entities via `buildTokens()`:

1. Source:
   1. `STATE.campaign.world.entities`
2. Projection fields include:
   1. identity (`id`, `characterId`, `name`)
   2. location (`hex`, `floorId`)
   3. visual (`kind`, `sprite`, `spriteScale`)
   4. combat (`hp`, `hp_max`, `init`, `side`, `hostility`, `conditions`)
   5. pointer to source entity (`__entity`)

## Fog and Room State

Fog classification combines:

1. explicit room fog mode (`visible`, `hidden`, `explored`, street-like modes)
2. persisted fog sets by floor
3. street-segment auto-reveal behavior driven by PC token positions

Room groups are computed as:

1. visible
2. explored
3. hidden

## Undo Snapshot Model

History stores full snapshots of:

1. `STATE.battle`
2. `STATE.entities`

Undo restoration rehydrates both and triggers:

1. floor selector refresh
2. status refresh
3. full render

