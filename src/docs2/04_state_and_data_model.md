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
3. Normalizes roof weathering payload (`roof.weathering`) with clamped `0..1` controls:
   1. `aging`
   2. `moss`
   3. `mottling`
   4. `streaks`
   5. `repairs`
   6. `contrast`
   7. stable `seed` (defaults to `roof.id` if absent)
4. Rebuilds roof spine metadata (`updateRoofSpine` callback).
5. Backfills object `floorId` where missing.

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

## Selectable Token Lists (PC/NPC/Monster)

Token placement now uses two controls:

1. `Token kind` (`pc`, `npc`, `monster`, `creature`)
2. `Token source` (existing entity, template, or `New ...`)

Behavior:

1. Selecting an `existing` entry re-places that canonical entity at the clicked hex.
2. Selecting a `template` entry creates a new entity from template seed data, then places it.
3. Selecting `New ...` creates a default new entity for the selected kind.

Template definition lookup order:

1. `campaign.meta_json.world.token_templates`
2. `campaign.meta_json.world.tokenTemplates`
3. `campaign.meta_json.token_templates`
4. `campaign.meta_json.tokenTemplates`
5. `campaign.meta_json.world.npcs` / `world.monsters` / `world.creatures` / `world.pcs`
6. `campaign.meta_json.npcs` / `monsters` / `creatures` / `pcs`
7. Built-in fallback names (used only if no campaign templates are found)

Recommended schema:

```json
{
  "world": {
    "token_templates": {
      "npc": [
        "Villager",
        {
          "id": "guard_watch",
          "name": "Town Guard",
          "kind": "npc",
          "side": "NPC",
          "sprite": "/images/tokens/guard.png",
          "appearance": { "sprite_scale": 1.4 },
          "stats": { "hp": 18, "init": 1 }
        }
      ],
      "monster": [
        {
          "id": "goblin_raider",
          "name": "Goblin Raider",
          "kind": "monster",
          "hostility": "hostile",
          "stats": { "hp": 9, "init": 2 }
        }
      ],
      "creature": [
        {
          "id": "wolf",
          "name": "Wolf",
          "kind": "creature",
          "hostility": "hostile",
          "stats": { "hp": 11, "init": 2 }
        }
      ]
    }
  }
}
```

Notes:

1. String templates are shorthand and become `{ "name": "<value>", "kind": "<selected kind>" }`.
2. Template `id` is only used as catalog identity; placed entities receive fresh runtime entity IDs.
3. Canonical persistence remains `world.entities` via `PATCH /api/campaigns/:campaign_id/entities`.

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
