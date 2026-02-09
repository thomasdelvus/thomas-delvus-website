# Battlemat3 Phase 0 Parity Baseline

Version: v1.00  
Date: 2026-02-09

## Scope

This checklist captures the baseline user-visible contract from `public/app/battlemat_next.html` that `public/app/battlemat3.html` must preserve.

## UI Surface

1. Canvas and layout:
   1. `#map` canvas in `#canvasWrap`.
   2. Right sidebar sections: Status, Chat, Inspector.
2. Tool buttons:
   1. Select
   2. Poly
   3. Roof
   4. Opening
   5. Object
   6. Token
3. Top controls:
   1. Layer select
   2. Handles toggle
   3. Hide Roofs toggle
   4. Street View toggle
   5. Roof line color
   6. Roof line width
   7. Undo
   8. Fog toggle
   9. Save
   10. Poly alpha
   11. Background toggle
4. Map controls:
   1. map X/Y offset
   2. map scale
   3. map rotation
   4. map selector
   5. floor selector
5. Navigation controls:
   1. pan pad (up/down/left/right)
   2. zoom range
   3. zoom in/out buttons
   4. bright labels toggle
   5. hexgrid toggle
   6. video quality select
6. Sidebar controls:
   1. status table and pills
   2. chat speaker select/input/send
   3. inspector dynamic fields and buttons

## Data/Network Contract

1. Read battle:
   1. `GET /api/battles/:battle_id`
2. Read campaign:
   1. `GET /api/campaigns/:campaign_id`
3. Read map list:
   1. `GET /api/battles?campaign_id=...`
4. Save battle:
   1. `PUT /api/battles/:battle_id` with full `state_json`.
5. Entity patch:
   1. `PATCH /api/campaigns/:campaign_id/entities`
6. Chat read:
   1. `GET /api/messages?campaign_id=...&since_ts=...&limit=...`
7. Chat send:
   1. `POST /api/messages`

## URL Query Contract

1. Battle id params: `battle_id`, `battleId`, `id`.
2. Auth params: `token`, `auth`, `bearer`.
3. Dev state params (localhost only): `dev_state`, `state_url`.

## Local Storage Contract

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
12. `bm_section_status`
13. `bm_section_chat`
14. `bm_section_inspector`

## Keyboard/Mouse Contract

1. Keyboard:
   1. `Ctrl/Cmd+Z` undo.
   2. `Delete/Backspace` delete selection (outside input fields).
   3. `Escape` cancels in-progress poly.
   4. `Control` key toggles handle-hot visualization.
2. Mouse:
   1. click selection and tool placement.
   2. drag interactions for room/roof handles and entities.
   3. wheel zoom on canvas wrapper.

## Fixtures Used for Baseline Validation

1. `src/docs/JSON_CrossKeys.JSON`
2. `src/docs/JSON_SaffrondaleStreets.JSON`

