# Player, Character, Campaign Model (v3)

## Overview

This document defines the current canonical model for players, characters, and campaigns.
It reflects the live D1 schema and the 22-character ID format now in use.

## Core Philosophy

- Fun-first: meaningful challenge without permanent punishment.
- Campaign authority: campaigns are the only write authority for character state.
- Character persistence: characters outlive campaigns.
- Low friction: players can start without accounts.
- Optional security: recovery and token rotation are opt-in later.

## ID Format

All primary IDs are **22-character URL-safe strings** (base64url).
This applies to:
- player_id
- campaign_id
- character_id
- battle_id

## Core Entities

### Player

A Player is an ownership scope and dashboard.

- Created automatically on first character creation
- Owns multiple characters
- May administer multiple campaigns
- Optional security later via dashboard_token and recovery

Key fields (players table):
- player_id (PK)
- dashboard_token (capability token)
- display_name, email, status
- meta_json
- version, created_at, updated_at

### Character

A Character is a player-owned persona.

- Owned by exactly one player
- Bound to zero-or-one active campaign at a time
- Read-only outside campaigns

Key fields (characters table):
- character_id (PK)
- player_id (FK)
- campaign_id (FK, nullable for unbound)
- name, sheet_json, notes_text
- version, created_at, updated_at

Rule:
Characters are only modified by the DM GPT acting within a campaign.

### Campaign

A Campaign is a playable timeline and the sole write authority.

- One admin player (host / subscription holder)
- Includes multiple characters
- Owns encounters, state, and consequences

Key fields (campaigns table):
- campaign_id (PK)
- admin_player_id (FK)
- name, summary_text, status
- auth_tokens_json (reserved for later)
- invites_json (reserved for later)
- meta_json
- version, created_at, updated_at

### Battle

Battles are campaign-scoped combat scenes.

Key fields (battles table):
- battle_id (PK)
- campaign_id (FK)
- name, state_json
- version, updated_at

## Relationships

- Player -> Characters: one-to-many
- Player -> Campaigns: one-to-many (as admin)
- Campaign -> Characters: one-to-many
- Character -> Campaign: zero-or-one active binding

## Campaign Binding

When a character joins a campaign:
- The character becomes campaign-bound.
- The campaign gains write authority.

When a character leaves a campaign:
- Campaign-bound items are removed.
- Campaign-specific effects are cleared.
- If the character was dead, they are resurrected.

## Consequences

Campaign-bound consequences do not follow a character outside the campaign unless explicitly promoted.

Examples:
- Plot-critical artifacts
- Faction titles or curses
- Campaign death

## Death Model

- Death is authoritative within the campaign.
- Leaving a campaign clears campaign-bound death.

## Player Dashboard

Each player has a dashboard that lists:
- Owned characters and their current campaign binding
- Administered campaigns
- Invitations (reserved for later)

## Security (Optional)

Dashboard tokens and recovery can be added later.
No passwords or traditional accounts are required for MVP.

---

This model mirrors tabletop play: campaigns are tables, characters are sheets, and fun outranks permanence.
