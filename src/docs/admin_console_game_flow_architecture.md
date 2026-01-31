# Admin Console & Game Flow Architecture

**Version:** v1.00  
**Status:** Canonical design guidance

---

## Purpose

This document defines the design philosophy, responsibilities, and expected behavior of the **Admin Console** and the **turn flow architecture** when running a campaign with a GPT-driven Dungeon Master.

The goal is to:
- Preserve a natural D&D table feel
- Keep the GPT as the authoritative DM
- Allow the hosting player (Admin) to also play a character
- Support remote and asynchronous play without ambiguity
- Ensure deterministic, safe progression of game state

This document is **descriptive and prescriptive**: it explains *why* the system works the way it does and *how* it must behave.

---

## Core Roles

### GPT (Dungeon Master)
- Sole adjudicator of rules, outcomes, and narration
- Reads player intent exclusively from chat
- Writes **narration and prompts** to chat
- Writes **procedural status** to the admin console
- Commits all mechanical outcomes to canonical state

### Admin (Host Player)
- Advances the game loop explicitly
- Does **not** adjudicate rules
- Does **not** narrate outcomes
- May also control a character like any other player
- Acts as the pacing controller and facilitator

### Players
- Speak freely in chat (table talk)
- Submit actions by addressing the DM explicitly
- Roll their own dice (physical or UI-assisted)
- Report rolls via chat

---

## Chat as the Table

The chat window represents **table conversation**.

### Chat Conventions
- Any message beginning with `DM,` is treated as an **action submission**
- Free-form conversation is allowed at all times
- Dice rolls are reported directly into chat (e.g., `Durin: 15`)
- Chat is the **only** source of player intent

### Action Indicators
- When a player submits an action, a visible flag/tick appears by their name
- Only one pending action per player is allowed
- Submitting a new action cancels the previous one

This mirrors real tabletop play: declare intent, clarify if needed, then resolve.

---

## Admin Console Philosophy

The Admin Console is **not** a DM interface.

It is:
- Procedural
- Minimal
- Boring by design

It exists to answer three questions at all times:
1. What phase are we in?
2. What input is currently awaited?
3. What will happen if the Admin advances the game?

The console must never contain narrative prose.

---

## Console Output Rules (Strict)

The GPT **must**:
- Write narration **only** to chat
- Write procedural status **only** to the console
- Produce exactly one console update per Admin advance

### Allowed Console Messages
Examples:
- `Waiting for Durin to submit an action.`
- `Waiting for Durin to roll d20.`
- `Action received: Durin → Attack (pending roll).`
- `Damage roll requested: 2d8 (slashing).`
- `Resolution complete. Advancing initiative.`
- `Round 3 complete. Beginning Round 4.`

### Disallowed Console Content
- Descriptive narration
- Dialogue
- Flavor text
- Rule explanations

If it would sound good read aloud, it does **not** belong in the console.

---

## The Enter Key Contract

The Admin advances the game by pressing **Enter**.

Enter always means:
> "GPT, read the current state and chat, then perform the next safe step."

### Enter Must Be Safe
Pressing Enter must never:
- Skip a player silently
- Resolve without required input
- Advance initiative incorrectly
- Perform irreversible actions without confirmation

If required input is missing, the GPT must **wait**.

---

## Turn Flow Architecture

The system operates as a two-phase loop.

### Phase 1: Await Input
- GPT checks initiative
- If the active entity has not acted:
  - GPT prompts them in chat
  - Console reflects what is awaited

Example console state:
> `Waiting for Durin to submit an action.`

### Phase 2: Resolve
- Required input exists in chat
- Admin presses Enter
- GPT resolves the action
- State is updated
- Narration is posted to chat
- Console reports resolution status

---

## Dice Handling Model

Players roll their own dice.

### Supported Methods
- Physical dice (reported manually)
- UI roll buttons that auto-post results to chat

The GPT:
- Never rolls player dice unless explicitly configured
- Treats reported values as authoritative
- Requests rolls explicitly when required

Example flow:
1. GPT: `Durin attacks Goblin 3. Roll d20.`
2. Console: `Waiting for Durin to roll d20.`
3. Player: `Durin: 15`
4. Admin presses Enter
5. GPT resolves hit and requests damage roll

---

## Initiative & Prompting

If a player does not act:
- GPT may prompt them in-character via chat
- No timers are required
- Admin intervention is not required beyond advancing Enter

This preserves social pacing without automation pressure.

---

## Remote Play Considerations

This architecture is explicitly designed for remote tables:
- Explicit prompts replace body language
- Admin-controlled pacing replaces DM intuition
- Chat is the single shared truth

The Admin Console acts as a **remote stage manager**, not a storyteller.

---

## Design Summary

- Chat is the table
- GPT is the DM
- Admin controls time, not outcomes
- Enter advances only when safe
- Dice live with players
- Structure replaces ambiguity

If the Admin spends most of the session pressing Enter, the system is working as intended.

