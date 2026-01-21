# Player Identity & Recovery Model

## Overview
This document defines the **player identity, access, and recovery model** for the system.

The design intentionally avoids traditional accounts, passwords, or logins. Instead, it uses **capability-based access** built around **PDF character sheets** and **opaque access links**. This approach is well-suited to tabletop play, CustomGPT constraints, and long-term scalability.

---

## Core Principles

- **Low friction:** No mandatory accounts, passwords, or sign-ups.
- **Player ownership:** Players physically possess their characters.
- **Privacy by default:** No enumerable IDs; all access tokens are unguessable.
- **Explicit responsibility:** Recovery methods are opt-in and clearly explained.
- **Future-proof:** Allows later addition of email, OAuth, sharing, or revocation without redesign.

---

## Key Concepts

### Character
- Represents a single playable character.
- Has a stable, opaque `character_id`.
- May appear in one or more campaigns.
- Can be exported as a PDF character sheet.

### Campaign
- Represents a world/timeline of play.
- Contains persistent consequences.
- Characters may move between campaigns.

### Player Dashboard
- A lightweight, capability-based view of "everything you own".
- Not an account.
- Accessed via a private link embedded in PDFs.

### Access Model
- Access is based on **possession of a private link**.
- Anyone with the link has access.
- This is intentional and clearly communicated to players.

---

## Primary Access Mechanism: PDF Character Sheets

The **PDF character sheet is the primary player-facing artifact**.

Each PDF:
- Contains the full character sheet for tabletop play.
- Embeds a **private access link** (and/or QR code).
- Acts as a recovery key.

Design intent:
> *This is your character. The online version is a convenience.*

### Security Model

- The PDF is a **bearer token**.
- Anyone with the PDF can access the associated player dashboard.
- This is explicitly disclosed to the player.

Example UX copy:
> "This PDF contains a private access link to your player dashboard. Anyone with it can access your characters. Save it somewhere safe."

---

## Player Dashboard

### Purpose

The dashboard provides a central place for players to:
- View all of their characters
- Export updated PDFs
- Navigate between campaigns

### Access

- Accessed via a private link embedded in PDFs.
- The link represents a **player capability token**.
- No login, password, or account is required.

### Initial Scope (MVP)

- List of characters
  - Name
  - Class / level
  - Campaign
  - Last updated
- Actions per character
  - View
  - Export PDF

No profile, settings, or identity management required initially.

---

## Recovery Strategy

### Primary Recovery

- **Possession of any previously exported PDF**.
- Clicking the embedded link restores access to the dashboard.

### Optional Secondary Recovery: Email

Email is **optional** and used only as a recovery index.

- Players may optionally associate an email address.
- Email is used only to send recovery links.
- One email may be associated with multiple characters/dashboards.
- No passwords are stored.

If email is not provided:
- Recovery is only possible via saved PDFs.

This tradeoff is made explicit to the player at creation/export time.

---

## Design Notes

- Access links should be opaque, random, and unguessable.
- Internally, access keys should be modeled as **rotatable** (even if revocation is not implemented initially).
- PDFs should embed links visibly (URL + QR code recommended).
- Email recovery should return access links, not raw IDs.

---

## Summary

This model:
- Eliminates account friction
- Fits tabletop culture naturally
- Works well within CustomGPT constraints
- Scales cleanly to large player counts
- Makes ownership and responsibility explicit

The PDF character sheet is the cornerstone of player identity. The player dashboard provides continuity. Email recovery is a safety net, not a dependency.

This approach prioritizes clarity, resilience, and long-term flexibility.

