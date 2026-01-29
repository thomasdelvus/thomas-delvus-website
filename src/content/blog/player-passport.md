---
title: "The Player Passport"
description: "A practical, low-friction identity system for Saffrondale players and campaigns."
pubDate: "Jan 27 2026"
heroImage: "/images/player_passport.jpg"
project: "saffrondale"
---

*A practical, low-friction identity system for a living world*

One of the quieter problems in tabletop gaming - especially when it crosses into digital space - is identity.

Characters are meant to be shared.  
Stories are meant to be retold.  
But **authority** - who can act on behalf of a player - must remain singular.

The Player Passport is how Saffrondale solves that without accounts, passwords, or a long recovery flow.

## The Problem with Accounts

A typical online game starts with usernames, passwords, and recovery emails. That brings real overhead: password resets, account hijacks, and a growing pile of personal data you never wanted to store.

For a small, experimental world, that felt wrong. Heavy. Fragile. And unnecessary.

Players do not need *accounts*.  
They need *continuity*.

## What the Passport Is

The Player Passport is a **single bearer credential**. Possession equals authority. It grants access to:

- All characters owned by that player
- All campaigns they administer or participate in
- The ability to continue play exactly where they left off

There are two ways to use it:

1) **Scan the QR code**  
   This opens the Player Dashboard with the token embedded in the URL fragment.

2) **Manual entry**  
   The Passport Key is printed beneath the QR code, so it can be copied and pasted if needed.

No usernames.  
No passwords.  
No email addresses.  
Just a key.

## What the Passport Is *Not*

The Passport is **not** a character sheet.

Character sheets are meant to be shared:
- Posted on blogs
- Sent to friends
- Passed around tables
- Archived as story artifacts

The Passport is different. It represents *authority*, not *identity*.

Anyone who possesses it can act on the player's behalf. Which leads to a simple rule:

> **Character sheets may be shared. Player Passports must not be.**

The example Passport in this post has its QR code and key intentionally obscured.

## Why This Is Safer Than It Looks

At first glance, bearer tokens feel risky. In practice, they dramatically reduce the attack surface:

- There is no personal data to steal  
- There are no passwords to reuse or reset  
- There is nothing to phish  
- There is nothing to recover  

Lose the Passport, and access is lost - just like losing a physical object. That tradeoff is intentional. It mirrors how tabletop play already works: if you lose your character sheet, the world does not owe you a backup.

## How It's Implemented (Briefly)

The Passport connects to the Player Dashboard, which reads from database tables for players, campaigns, and characters. The key is stored as a `dashboard_token` on the player record and exposed via a QR code and copyable text.

This keeps the system simple and auditable:
- database holds the source of truth (players, campaigns, characters, battles)
- database stores images (character portraits and a shared Passport background)
- The dashboard aggregates characters and campaigns for a player

The key never needs to be emailed, reset, or recovered. It just needs to be guarded.

## A Physical Metaphor for a Digital World

The Passport is intentionally narrative. It is a document you could imagine keeping in a satchel or locked in a drawer. It fits the fiction because it behaves like an object *within* it.

Saffrondale is built around persistent artifacts: maps, locations, and consequences. The Passport is simply another artifact - one that lives half in the story and half in the machinery that supports it.

Store it securely.  
Do not distribute it.  
And when you return, your world will still be waiting.
