# Battlemat3 Behavior Contract Catalog

Version: v1.00  
Updated: 2026-02-10

This document is the parity audit checklist for user-visible and API-visible behavior.

## UI Control Catalog

Top tools:

1. `#toolSelect`
2. `#toolPoly`
3. `#toolRoof`
4. `#toolOpening`
5. `#toolObject`
6. `#toolToken`

Global controls:

1. `#layerSelect`
2. `#handlesToggle`
3. `#hideRoofsToggle`
4. `#streetViewToggle`
5. `#roofLineColor`
6. `#roofLineWidth`
7. `#btnUndo`
8. `#fogToggle`
9. `#btnSave`
10. `#polyAlpha`
11. `#backdropToggle`
12. `#saveStatus`

Map controls:

1. `#mapOffsetX`
2. `#mapOffsetY`
3. `#mapScale`
4. `#mapRot`
5. `#mapSelect`
6. `#floorSelect`

Navigation controls:

1. `#panUp`
2. `#panDown`
3. `#panLeft`
4. `#panRight`
5. `#zoom`
6. `#zoomOut`
7. `#zoomIn`
8. `#zoomLevel`
9. `#labelBoldToggle`
10. `#hexGridToggle`
11. `#videoQuality`

Chat and status:

1. `#statusMeta`
2. `#statusBody`
3. `#chatLog`
4. `#chatSpeaker`
5. `#chatInput`
6. `#chatSend`

Inspector:

1. `#inspectorEmpty`
2. `#inspectorFields`

## Keyboard Contract

1. `Ctrl/Cmd+Z` triggers undo.
2. `Delete`/`Backspace` delete selection when not typing in input/select/textarea.
3. `Escape` cancels active poly placement.
4. `Control` toggles handle-hot mode while held.

## Mouse and Drag Contract

1. click-to-place for opening/object/token/poly points
2. drag-select/move behavior for selected entities
3. polygon and roof handle manipulations
4. wheel zoom inside canvas wrapper
5. pan/zoom hold buttons repeat while pressed

## URL/Auth Contract

Battle id keys:

1. `battle_id`
2. `battleId`
3. `id`

Auth keys:

1. `token`
2. `auth`
3. `bearer`

Localhost override keys:

1. `dev_state`
2. `state_url`

## Local Storage Contract

Preference keys:

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

Section collapse keys:

1. `bm_section_status`
2. `bm_section_chat`
3. `bm_section_inspector`

## API Endpoint Contract

1. `GET /api/battles/:battle_id`
2. `PUT /api/battles/:battle_id`
3. `GET /api/campaigns/:campaign_id`
4. `PATCH /api/campaigns/:campaign_id/entities`
5. `GET /api/messages`
6. `POST /api/messages`
7. `GET /api/battles?campaign_id=...` (map options)

## Save Payload Contract

1. full-state payload is used
2. wrapper records preserved when applicable
3. internal transient ids removed before persistence:
   1. `_battle_id`
   2. `_campaign_id`

## Chat Contract

1. poll interval: 3000ms
2. poll keys: `campaign_id`, `since_ts`, `limit`
3. send defaults: `type=player`, `status=new`

## Undo Contract

1. snapshots include full battle + entities
2. history limit enforced
3. undo updates floor/options/status/render
4. keyboard path guarded against key repeat to avoid multi-step undo on a held key

