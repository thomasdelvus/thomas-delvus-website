# Battlemat3 API Contracts

Version: v1.00  
Updated: 2026-02-10

## Contract Priority

1. Runtime behavior in `battlemat_next.html` is compatibility authority.
2. `battlemat3` must preserve endpoint paths, core payload semantics, and fallback query keys.

## Query Parameter Contract

Supported battle id keys:

1. `battle_id`
2. `battleId`
3. `id`

Supported auth token keys:

1. `token`
2. `auth`
3. `bearer`

Localhost-only dev load keys:

1. `dev_state`
2. `state_url`

## Authentication Headers

If token query key is present:

1. request header includes `Authorization: Bearer {token}`
2. otherwise no auth header is sent

## Load Contracts

1. Battle load:
   1. `GET /api/battles/:battle_id`
   2. parse `state_json` when present
2. Campaign load:
   1. `GET /api/campaigns/:campaign_id`
3. Map options:
   1. preferred `GET /api/battles?campaign_id=...`
   2. fallback from campaign POI metadata

## Save Contracts

Battle save (`saveState`):

1. endpoint: `PUT /api/battles/:battle_id`
2. body: `{ state_json: <full state> }`
3. cleanup before persistence:
   1. remove `_battle_id`
   2. remove `_campaign_id`
4. wrapper records are preserved when source was wrapped:
   1. keep `records` container
   2. keep `active.recordId`

Entity sync (`saveEntityPatch`):

1. endpoint: `PATCH /api/campaigns/:campaign_id/entities`
2. body:
   1. `entity_id`
   2. `patch`
   3. `create_if_missing`

## Chat Contracts

Chat poll:

1. endpoint: `GET /api/messages`
2. query keys:
   1. `campaign_id`
   2. `since_ts` (optional)
   3. `limit` (set to `200`)
3. poll interval:
   1. `3000ms`

Chat send:

1. endpoint: `POST /api/messages`
2. body:
   1. `campaign_id`
   2. `speaker`
   3. `text`
   4. `type` = `player`
   5. `status` = `new`

## Failure Semantics

1. Save failure:
   1. UI status `DB: error`
2. Chat poll/send failure:
   1. console warning
   2. app remains interactive
3. Entity patch failure:
   1. non-blocking best-effort behavior

