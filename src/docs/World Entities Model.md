# World Entities Model (Canonical State)

This document describes the current data model where **world entities are canonical** and **battle records are geometry-only**.

## Summary
- **Canonical entity state** lives in `campaign.meta_json.world.entities`.
- **Battle records** only store scene geometry (rooms/openings/objects/fog/meta).
- The UI renders tokens from **world entities** and filters by `location.poi_id`.
- Global initiative lives in `campaign.meta_json.world.battle`.

## Campaign meta_json shape
```json
{
  "follow_mode": "active_turn",
  "poi_index": {
    "CrossedKeysInn": "wn8SPmdKotXPMFFXsXzLgA",
    "SaffrondaleStreets": "bw00J4YFzxUy92Ng3glgAg"
  },
  "world": {
    "entities": [
      {
        "id": "uKHpm1HN6NNvbcQyYvKLkw",
        "character_id": "uKHpm1HN6NNvbcQyYvKLkw",
        "name": "Durin",
        "kind": "pc",
        "stats": { "hp": 42, "maxHp": 42, "init": 14 },
        "location": { "poi_id": "CrossedKeysInn", "floorId": "upper", "hex": "U16" }
      }
    ],
    "battle": {
      "mode": "global",
      "round": 1,
      "active": "uKHpm1HN6NNvbcQyYvKLkw",
      "order": [
        "uKHpm1HN6NNvbcQyYvKLkw",
        "Dd0Y0tucPXlFY44Nz4YdnQ",
        "gzVRo76msnG3tE2MVAHfPQ"
      ]
    }
  }
}
```

### Entity fields (recommended)
- `id` **(required)**: canonical entity id. For PCs this should equal `character_id`.
- `character_id`: PC reference (optional for NPCs/monsters).
- `kind`: `pc | npc | monster | creature`.
- `stats`: canonical combat stats (hp, maxHp, init, ac, etc).
- `location`: authoritative position
  - `poi_id`: record id (e.g. `CrossedKeysInn`)
  - `floorId`: floor identifier (e.g. `upper`)
  - `hex`: hex label (e.g. `U16`)
- `hostility`: `friendly | neutral | hostile` (optional).
- `listed` / `in_battle`: optional boolean to control HUD listing for non-PCs.

## Battle record shape
- **No tokens/actors**. Only geometry and scene-local data.
- Example keys:
  - `floors`, `rooms`, `openings`, `objects`
  - `fog`, `meta`, `view`

## Rendering rules
- UI renders tokens from `world.entities` **filtered by** `location.poi_id`.
- Local battle tokens are ignored if world entities exist.
- Status HUD shows:
  - All PCs (always listed)
  - Non-PCs if `listed` (or `in_battle`) is true
  - Hostiles default to listed when `hostility: "hostile"`

## Global initiative
- `world.battle.order` is the canonical initiative list.
- `world.battle.active` is the active entity id.
- `follow_mode: "active_turn"` makes the UI auto-follow by active entity.

## Conventions
- **PC tokens** use `id = character_id`.
- `poi_index` maps POI ids to battle record ids.
- Use `world.entities` for all persistent or roaming entities.

## Migration notes
- Remove `tokens` and `actors` from battle records.
- Move all entity data into `campaign.meta_json.world.entities`.

