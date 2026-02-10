# Battlemat3 Chat, Status, and Entity Sync

Version: v1.00  
Updated: 2026-02-10

## Chat Runtime

Chat controller is in `public/app/battlemat3/modules/chat.js`.

Core functions:

1. `populateChatSpeakerSelect()`
2. `mergeChatRows()`
3. `renderChat()`
4. `fetchChat()`
5. `pollChat()`
6. `startChatPolling()`
7. `sendChatMessage()`

## Chat Data Flow

1. Poll loop fetches rows by `campaign_id` and incremental `since_ts`.
2. Rows are merged by stable `chat_id`.
3. Existing rows are updated in place if repeated with newer fields.
4. Rows are sorted ascending by `created_at`.
5. UI log is rerendered and scrolled to bottom.

## Chat Status Rendering

Mapped CSS classes:

1. `ack`
2. `processed`
3. `canceled`
4. default none

This maintains compatibility with existing visual signaling.

## Speaker Selection Behavior

Speaker options are derived from current tokens plus defaults:

1. ensure `DM`
2. ensure `Player`
3. keep selected value stable when input is focused

## Status Panel Runtime

Status panel uses token projection from `buildTokens()`:

1. initiative sort descending with name fallback tie-break
2. active actor inferred from battle turn metadata
3. HP/init/condition cells rendered from token/entity fields

## Entity Sync

Token movement and edits flow through entity patch path:

1. token mutation updates entity projection
2. changes are debounced via `queueEntitySave` (~400ms)
3. patch sent to `/api/campaigns/:campaign_id/entities`

Patch includes:

1. identity and classification (`name`, `kind`, `side`)
2. POI and location (`poi_id`, `location.hex`, `location.floorId`)
3. optional `stats` (`hp`, `init`)
4. optional sprite and appearance scale fields

## Failure Behavior

1. chat poll/send failures warn and continue
2. entity patch failures are non-blocking
3. UI should remain responsive through backend transient issues

