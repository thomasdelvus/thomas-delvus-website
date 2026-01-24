# Data Model v1.00

This document describes the current D1 schema and relationships.
All IDs are 22-character URL-safe strings.
Timestamps are epoch seconds.

## players

- player_id (PK)
- dashboard_token
- display_name
- email
- status
- meta_json
- version
- created_at
- updated_at

## campaigns

- campaign_id (PK)
- admin_player_id (FK -> players.player_id)
- name
- summary_text
- status
- auth_tokens_json
- invites_json
- meta_json
- version
- created_at
- updated_at

## characters

- character_id (PK)
- campaign_id (FK -> campaigns.campaign_id, nullable)
- player_id (FK -> players.player_id)
- name
- sheet_json
- notes_text
- version
- created_at
- updated_at

## battles

- battle_id (PK)
- campaign_id (FK -> campaigns.campaign_id)
- name
- state_json
- version
- updated_at

## Relationship summary

- Player owns many Characters
- Player administers many Campaigns
- Campaign includes many Characters
- Character bound to zero-or-one Campaign
- Campaign includes many Battles

## Conventions

- IDs are 22-character base64url strings (genId22).
- JSON fields store stringified JSON (sheet_json, state_json, meta_json, auth_tokens_json, invites_json).
- Use version increments on update.
