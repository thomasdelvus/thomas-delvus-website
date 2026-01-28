# Battlemat Design

<!--
Changelog
- 2026-01-27: initial draft
-->

## Purpose
The battlemat is the primary tactical surface for play. It renders hex-based scenes, supports map editing, manages state synchronization with the backend, and provides a multiplayer chat/intent workflow that integrates with the DM GPT.

This document captures the current architecture, workflows, UI conventions, data expectations, and known extension points.

## Core Principles
- Single source of truth is the battle record for state; chat is append-only in `messages`.
- Edits are incremental patches, never full overwrites unless explicitly requested.
- UI should be low-friction and avoid modal interruptions during play.
- The DM GPT acts as adjudicator and should be able to read intents from chat without special client metadata.

## Architecture Overview
### Frontend (battlemat.html)
- Renders the map, tokens, rooms, openings, objects.
- Editor tools for drawing rooms, placing doors/windows/objects, deleting, and undo.
- Polls backend for state and messages.
- Displays status panel (initiative, HP, conditions), log/chat, and editor controls.

### Backend (Worker)
- `/battles/{battle_id}` GET/PUT: state_json read/write.
- `/messages` GET/POST: append-only chat table.
- `/messages/{chat_id}` PATCH: update message `status` (ack/processed/canceled).
- Chat data is stored in `messages` table, not in `battles`.

### GPT Actions
- Uses `/battles/{battle_id}` for state updates.
- Uses `/messages` for posting DM/player chat entries.
- Uses `/messages/{chat_id}` to set `ack`, `processed`, or `canceled`.

## Data Model (Battle State)
### State JSON (battle state)
Key expected fields (non-exhaustive):
- `meta`: title, scale, fog mode, etc.
- `turn`: round, active token id, initiative order
- `tokens`: actors with positions, HP, side, label, floor
- `floors`: per-floor rooms, openings, objects
- `view`: camera and floor selection
- `fog`: fog of war config and explored/visible room ids
- `last_action`: short mechanical summary
- `narration`: short descriptive narration

### Rooms
- Rectangle defined by two hex corners (TL/BR style in editor).
- Fields: `id`, `corners[]`, `thickness`, `floor.kind`, `wall.kind`.
- Can be wall-less (thickness 0) for streets/hallways.

### Openings (doors/windows/thresholds/portals)
- Fields: `id`, `kind`, `hex`, `orientation`, `openPct`.
- Door knockout uses wall thickness; window uses lower alpha for hole.

### Objects
- Fields: `id`, `kind`, `hex`, `rotDeg`, `ox`, `oy`, `spriteScale`, optional `floorId`.
- Z-order is list order; editor supports bring front/send back.

### Tokens
- Fields: `id`, `name`, `side`, `hex`, `label`, `init`, `hp`, `floorId`.
- Optional: `character_id` to open character sheet.

## Chat / Messages System
### Table: `messages`
Fields (current usage):
- `chat_id` (primary key)
- `campaign_id`
- `battle_id`
- `speaker`
- `speaker_id`
- `text`
- `type` (`player`, `dm`, `action`, `system`)
- `status` (`new`, `ack`, `processed`, `canceled`)
- `created_at` (unix seconds)

### Intended Flow
1) Player posts a line. If it begins with `DM,` it is treated as `type=action`.
2) New action auto-cancels any prior `new`/`ack` action from same speaker.
3) GPT can `PATCH /messages/{chat_id}` to set `ack` or `processed`.
4) Players can cancel by clicking their tick indicator (sets `canceled`).

### UI Behavior
- Unread badge counts messages newer than local read timestamp.
- Log renders:
  - `ack`: gray
  - `canceled`: red + strike
  - `processed`: green (optional)
- Status panel shows a tick for latest `new/ack` action per speaker.
- Tick hover shows action text; click cancels.

### Recommended Future Extensions
- Add `processing` status when GPT is actively resolving.
- Add `addressed_to` or `parsed_intent` for structured actions.
- Add `resolves_chat_id` field on DM replies for traceability.

## Rendering / Grid
- Flat-top hexes using odd-q offset coordinates.
- Hex labels are alphanumeric like `A1`.
- 1 hex = 5 ft (default).

## Fog of War
- Room-based fog mode supported.
- `fog.enabled` controls visibility.
- Fog floors can be used for interiors; when fog disabled, fog floors can be hidden.

## Editor Tools
- Select, Room, Door, Window, Object, Delete.
- Undo snapshot for last change.
- Bring front / send back for objects and rooms.
- Room editor supports editable corners, floor kind, wall kind, thickness.
- Object editor supports kind, rotation, offsets, scale.

## Playtest Mode
- Hides editor/debug UI but keeps player essentials (labels, movement, zoom, status, log).
- Toggle is a top-bar checkbox.

## API Expectations
- All writes are incremental patches.
- Deletions are via `{ id, deleted: true }` not omission.
- State writes and chat writes are separate endpoints.

## Known Edge Cases
- Image `NS_BINDING_ABORTED` typically indicates interrupted load or missing assets.
- If door knockouts appear too large, ensure wall thickness is respected and sprite scaling is not applied to the knockout.

## Testing Checklist
- State GET/PUT with a live battle id.
- Messages POST and PATCH.
- Action tick appears for latest new/ack action.
- Cancel action updates status and UI.
- Chat read badge increments and clears.
- Undo restores last edit.
- Room/door/window/object placement persists after save.

## Open Ideas / Backlog
- Add persistent read markers per player (server-side).
- Add action queue panel above log for DM.
- Add lightweight turn reminder in chat.
- Add auto-collapse for long narration.
- Add optional chat filters (dm/action/player).
