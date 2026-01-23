# Player, Character, Campaign Model (v2)

## Overview

This document defines the **current canonical model** for players, characters, and campaigns, incorporating the refined philosophy around **campaign authority**, **character ownership**, and **fun-first play**.

The system intentionally avoids traditional accounts, passwords, or logins. Instead, it uses **automatic player dashboards**, **campaign-scoped write authority**, and **optional security hardening** via a Player Passport.

This document supersedes earlier identity-only models and should be treated as the reference for Codex and implementation work.

---

## Core Philosophy

* **Fun-first:** The goal is meaningful challenge, not permanent punishment.
* **Campaign authority:** All read/write mutation happens through a campaign.
* **Character persistence:** Characters outlive campaigns and social conflicts.
* **Low friction:** New players can start playing immediately.
* **Explicit trust:** Joining a campaign is consent to that campaign’s DM authority.

---

## Core Entities

### Player

A **Player** represents an ownership scope and dashboard.

* Created automatically on first character creation
* May own multiple characters
* May administer multiple campaigns
* May optionally secure their dashboard later

Players are not traditional accounts. They are anonymous by default and identified by a capability token.

---

### Character

A **Character** represents a player-owned persona.

Key properties:

* Owned by exactly one Player
* May be **unbound** or **bound to one active Campaign** at a time
* Character sheets are **read-only artifacts**
* Characters cannot be directly edited by players

Important rule:

> **Characters are only modified by the DM GPT acting within a campaign.**

Characters persist even if campaigns end, players leave groups, or social conflicts occur.

---

### Campaign

A **Campaign** represents a single playable timeline or instance.

Key properties:

* Has one admin Player (the host / subscription holder)
* May include multiple Characters
* Is the sole write authority for character mutation
* Owns campaign-specific state, encounters, and consequences

Important rule:

> **Read/write is a function of the campaign.**

---

## Relationships

* Player → Characters: **one-to-many**
* Campaign → Characters: **one-to-many**
* Character → Campaign: **zero-or-one (current binding)**

A character may only participate in one campaign at a time.

---

## Campaign Binding

### Binding

When a character joins a campaign:

* The character becomes **campaign-bound**
* The campaign gains write authority over that character
* The player is explicitly trusting the campaign admin / DM

### Leaving a Campaign

When a player clears a character’s campaign binding:

* Campaign-bound items are removed
* Campaign-specific effects are cleared
* If the character was dead, they are resurrected
* Core character identity is retained

This mirrors tabletop reality: the campaign retains its story, the player keeps their character.

---

## Campaign-Bound Consequences

Some consequences are scoped to the campaign that authored them.

Examples:

* Legendary or unique artifacts
* Plot-critical items
* Faction titles or curses
* Campaign death

Design rule:

> **Campaign-bound consequences do not follow a character outside the campaign unless explicitly promoted.**

This preserves narrative integrity while avoiding global punishment.

---

## Death Model

* Death is **authoritative within the campaign**
* Resurrection may occur within the campaign
* Leaving a campaign clears campaign-bound death

This aligns with real tabletop play and CRPG expectations (e.g., BG3): risk matters during play, but characters are not erased from existence.

---

## Player Dashboard

Each player is automatically given a **Player Dashboard**.

The dashboard:

* Lists all owned characters
* Shows current campaign binding per character
* Lists campaigns the player administers
* Clearly indicates security status (e.g. recovery email: none)

The dashboard exists even for unsecured, anonymous players.

---

## Player Passport (Optional Security Layer)

The **Player Passport** is an optional hardening mechanism.

Purpose:

* Secure ownership of characters and campaigns
* Enable recovery if access tokens are lost
* Allow rotation/revocation of access tokens

Key points:

* Not required to play
* Only place where rotating security tokens are needed
* Does not change the core player/character/campaign model

---

## Campaign Creation Workflow

1. Player creates one or more Characters
2. Characters are initially unbound
3. Player chooses to begin adventuring
4. A Campaign is created
5. Selected Characters are bound to the Campaign

All mutation from that point forward occurs via the campaign.

---

## Design Summary

* Players own characters
* Campaigns write reality
* Characters persist beyond campaigns
* Consequences are scoped to the story that created them
* Security is optional and explicit

This model intentionally mirrors real tabletop behavior: campaigns are tables, characters are sheets, and fun outranks permanence.
