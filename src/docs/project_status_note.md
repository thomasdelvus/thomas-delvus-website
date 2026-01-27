# Project Status Note - Player Dashboard, Passport, Character Sheet

## Purpose and Goals
- **Character Sheet**: Read-only, shareable view of a single character with printable layout. Designed for player use during sessions and for DM review.
- **Player Dashboard**: Central hub for a player to view their characters, campaigns, and invites. Designed to be the entry point for managing access and actions.
- **Player Passport**: A printable (and downloadable) personal access document that embeds the player’s access key for recovery and automation. It doubles as a quick “unlock” artifact for GPT and for personal use.

## Current UX Summary
- **Character Sheet** (`/app/character`)
  - Read-only display of character data.
  - Uses D1 data (characters table) and portrait in R2.
  - Supports print/PDF output; layout tuned for consistent print.
- **Player Dashboard** (`/app/player.html`)
  - Reads player, characters, campaigns, invites.
  - Shows character thumbnails from R2 (`/portraits/{character_id}.jpg`).
  - Includes "Create Player Passport" link with player_id query param.
  - Adds Bearer token support via `#passport=<token>` fragment.
- **Player Passport** (`/app/passport.html`)
  - Renders from player + character data.
  - QR code points to dashboard with `#passport` fragment.
  - Shows Passport Key (dashboard_token) in plain text + copy button.
  - Character portrait pulled from `passport_character_id` or first character.
  - Print output includes a compact summary section (characters + campaigns).
  - Download button exports **static** self‑contained HTML snapshot (images embedded, scripts removed).

## Data Model (D1 Tables)
- **players**
  - `player_id` (PK)
  - `dashboard_token`
  - `passport_character_id`
  - `display_name`, `email`, `status`, `meta_json`, `version`, `created_at`, `updated_at`
- **campaigns**
  - `campaign_id` (PK)
  - `admin_player_id` (FK to players)
  - `name`, `summary_text`, `status`, `auth_tokens_json`, `meta_json`, `invites_json`
  - `version`, `created_at`, `updated_at`
- **characters**
  - `character_id` (PK)
  - `campaign_id` (FK)
  - `player_id` (FK)
  - `name`, `sheet_json`, `notes_text`
  - `version`, `created_at`, `updated_at`
- **battles**
  - `battle_id` (PK)
  - `campaign_id` (FK)
  - `name`, `state_json`, `chat_json`
  - `version`, `updated_at`

## R2 Storage
- **Character portraits**: `characters` bucket
  - `portraits/{character_id}.jpg`
- **Passport background**: `players` bucket
  - `passports/player_passport.jpg`

## Worker (Game API)
- Current draft: **v3.41**
  - Adds `chat_json` support for battles
  - Includes `dashboard_token` + `passport_character_id` in player GET payload
  - Supports portrait upload endpoint
  - Provides `/players/:id`, `/players/:id/characters`, `/players/:id/campaigns`, `/players/:id/invites`

## Authentication (Current Direction)
- Use **dashboard_token** as the primary key for dashboard access.
- Passport QR encodes:
  - `https://delvus.net/app/player.html?player_id=...#passport=<token>`
- Dashboard reads token from `#passport`, stores in localStorage, and sends:
  - `Authorization: Bearer <token>` header on API requests.

## Status Summary
- **Character Sheet**: polished, print‑ready.
- **Player Dashboard**: reading live DB, shows portraits, minimal actions.
- **Player Passport**: live + downloadable static snapshot, QR + token.
- **Worker**: v3.41 ready to deploy (player payload includes token & passport_character_id).

## Near‑Term Next Steps
- Enforce token auth server‑side on player endpoints.
- Add dashboard prompt for token when not found in storage.
- Optional: character selection UI for passport portrait.
- Optional: campaign/player management actions once auth is in place.
