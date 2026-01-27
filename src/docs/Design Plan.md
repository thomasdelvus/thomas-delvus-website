# Battlemat + GPT GM Design Plan

## Vision

Build a **GPT-assisted tabletop combat system** where the **browser battlemat is the live “truth display”** and the **GPT is the “rules + narration engine”** that updates a battle’s canonical JSON state. We want it to feel like:

* **A real VTT board** (tokens, walls/doors/windows, difficult terrain, props, initiative panel)
* **A live combat log + narrated fiction**
* **Stateful play** (nothing “resets” unless we choose to)
* **One human operator (the account owner) acts as typist** while other players participate naturally (voice)

The core principle: **the battlemat is dumb but reliable** (render + polling), while **the backend + GPT own the authoritative state**.

---

## Core Architecture

### A) Canonical Scene State (JSON)

Every battle is represented by a single **SCENE JSON** document that contains:

* `round`
* `rooms[]` (rect wall perimeters by corner labels)
* `openings[]` (doors/windows on room walls, with `state: open|closed`)
* `objects[]` (tables, sarcophagi, pillars, difficult terrain, etc.)
* `actors[]` (tokens: id/name/side/init/hp/maxHp/effects/at/label)
* optional narrative fields:

  * `last_action` (short action summary)
  * `narration` (long-form fiction/GM text)

**Design intent:** the GPT modifies only the JSON; the client only renders.

### B) Persistence Layer

Each battle has a durable record in the database (D1):

* `battle_id`
* `state_json` (stringified SCENE)
* `version` (monotonic counter)
* `updated_at`

The backend is responsible for:

* applying updates (merge or full replace, depending on endpoint)
* incrementing `version`
* storing the updated state in `state_json`

### C) Client (Battlemat HTML)

The battlemat page:

* loads SCENE from the backend using the URL form: **`/play/<battle_id>`**
* overwrites the embedded JSON with the loaded state
* renders the entire scene deterministically
* polls on a refresh ladder (fast when active, slower when idle)
* displays:

  * initiative table with HP
  * **last action** banner
  * **narration** text box

Client philosophy: **never trust local edits long-term**; always treat the DB state as canonical.

---

## 1) Distance Calculation API (New)

### Goal

Provide a clean, canonical way for GPT (and/or UI helpers) to ask:

* “What is the hex distance from Aelar at F6 to Lich at F9?”
* “What tiles are reachable with 30 ft movement, given walls/doors and blocking?”
* “Show the shortest path (and optionally draw it).”

### Why this matters

Right now the system can *render* and *persist* state. The next jump is letting the GPT do **rules-accurate movement + range checks** without handwaving.

### Proposed endpoint shape (conceptual)

* **Inputs**:

  * start hex (`from`)
  * end hex (`to`) or movement budget (`speedFeet`)
  * `battle_id` (to load canonical blocking/walls/door states)
  * rules knobs (diagonal/hex rules, difficult terrain costs, etc.)

* **Outputs**:

  * `distanceHexes`
  * `distanceFeet`
  * `path[]` as a list of hex labels
  * `blockedReason` if no path

### Examples

* **Simple range**: “Magic Missile range check: Caelin M3 → Lich F9: 7 hexes (35 ft). In range.”
* **Movement**: “Brunna can move 6 hexes; shortest path H6→K6 is blocked by table; alternate path length 7.”
* **Door state impact**: “Door at N6 is closed, so east exit is blocked until opened.”

### UI tie-in

We already added a “movement trail” visualization based on commit-to-commit token position changes. The distance API unlocks a richer future version:

* show *actual computed path* (step-by-step)
* render a temporary highlight trail
* enforce legal movement when desired

---

## 2) Canonical Maps + POIs with Campaign-Persistent State

### Goal

When the party enters a **Point of Interest (POI)** (dungeon room, tavern, street encounter), the GPT should:

1. Load a **canonical map template** for that POI (the “base truth”).
2. Create a **campaign-specific instance** of that POI state (the “mutable truth”).
3. From then on, always update **the instance**, never the template.

This gives us:

* repeatable content (same POI can be used in many campaigns)
* persistent consequences (doors opened, enemies killed, furniture moved, traps sprung)

### Conceptual data model

* **Map Template (canonical)**

  * immutable definition: rooms/openings/props/default enemies
  * stored as a named asset, e.g. `poi:crypt_lich_room:v1`

* **Campaign POI Instance**

  * mutable state keyed by (`campaign_id`, `poi_id`)
  * first entry clones the template into a new state record
  * subsequent entries load the existing record

### First-entry workflow (POI boot)

* Party enters POI “Crypt: Antechamber”
* Backend/GPT:

  * `GET template(crypt_antechamber)`
  * `CREATE battle` (or `CREATE poi_instance`) with cloned SCENE
  * returns `battle_id`
* Client opens `/play/<battle_id>` and becomes the live display

### Re-entry workflow

* Party returns later
* Backend loads the same campaign instance state and continues from where it left off

### Example outcomes

* Wraith 2 remains at `hp: 0` and stays dead on the board.
* Door that was opened last session stays open.
* Narrative log shows the last action from the previous session.

---

## 3) “Owner Typist” + Voice Participation Model

### Goal

Make table play smooth without forcing every player to type into the GPT.

**Model:**

* The **OpenAI account owner** runs the session and is the **only typist**.
* Other players participate normally:

  * they **speak** their actions
  * everyone watches the **shared web battlemat** update live

This matches real-table dynamics: one GM/operator, many players.

### Why this works

* avoids multi-user editing races
* keeps the GPT context coherent (one input stream)
* keeps the UI state authoritative (DB)

### Typical turn flow

1. Players speak: “Caelin casts Magic Missile at the lich.”
2. Owner types a condensed instruction to GPT:

   * “Resolve Caelin’s action. Update SCENE: lich hp -12, set last_action, append narration.”
3. GPT outputs a JSON patch or full SCENE update.
4. Backend persists it; client polls and updates.
5. Everyone sees:

   * initiative/HP change
   * last action banner
   * new narration paragraph

### Voice participation options (conceptual)

* **Low-tech**: players speak; owner transcribes (works now)
* **Later**: add speech-to-text capture for players, but still funnel through the owner for final submission

---

## Current Battlemat Deliverables (Baseline)

### Live rendering + UI

* Hex grid with coordinate labels
* Rooms with thick wall bands
* Doors/windows placed on room walls and rendered by state
* Objects + difficult terrain rendering
* Tokens with side coloring and labels
* Initiative/HP status panel

### Live updates + polling

* `/play/<battle_id>` URL parsing survives Cloudflare rewrites
* Reads from the battle API and overwrites embedded SCENE JSON
* Auto refresh ladder (fast when active, slows down with idle)

### Narrative support

* **last_action**: short, punchy combat log line
* **narration**: longer descriptive text

### State safety

* SCENE JSON parse guard (last known good state remains visible if bad JSON appears)
* Version/updated_at based change detection (when available)

### Visual motion cue

* “movement trails” derived from prior token position to new token position between commits

### Visual upgrade path

* Sprite-capable rendering (vector fallback if assets missing)

---

## Canonical Update Rules (What the GPT Should Do)

### Canonical rule

The GPT updates **only the battle’s SCENE state**.

### Turn rhythm (hard order)

A. Resolve action (rolls/checks privately)
B. Commit incremental update (PUT)
C. Narrate outcome (only after commit succeeds)
D. Advance initiative / round

**Round increment:** when the final actor in initiative completes their turn, increment `round` by 1 and continue from the top of initiative.

### Schema conventions

* Prefer **snake_case** as canonical keys (`last_action`, `updated_at`, etc.).
* **Transitional compatibility:** while older clients/merges may still reference `lastAction`, write **both** for now:

  * `last_action`: canonical persisted field
  * `lastAction`: mirrored UI field (optional, until fully retired)
* Narration should be written into state (e.g., `narration`) when you want players to see it.
* **IF YOU WANT PLAYERS TO SEE IT, IT MUST EXIST IN THE BATTLE RECORD.**

### Effects format (now + future-proof)

* Current baseline: `effects: ["poisoned", "prone"]`
* Allowed future format (optional):

  * `effects: [{"name":"bless","duration":3},{"name":"poisoned"}]`
* Client should tolerate either form; GPT should preserve existing style in-record.

### Output expectations (in practice)

For each resolved action, the GPT should update:

* actor hp changes (and set dead/defeated state if hp <= 0)
* positions if movement occurred
* door/window state if interacted with
* effects array for conditions
* `last_action` (single-line summary)
* `narration` (short scene beat players can read)

### Commit examples (incremental patches)

**1) Movement + attack (and update last_action/narration)**

```json
{
  "actors": [
    {"id":"aelar","at":"F6"},
    {"id":"wraith3","hp":63}
  ],
  "last_action": "🗡️ Aelar hits Wraith 3 for 4 dmg.",
  "lastAction": "🗡️ Aelar hits Wraith 3 for 4 dmg.",
  "narration": "Aelar closes in—steel hissing through cold mist as the wraith recoils."
}
```

**2) Door interaction**

```json
{
  "openings": [{"id":"door_e_1","state":"closed"}],
  "last_action": "🚪 Door slammed shut.",
  "lastAction": "🚪 Door slammed shut.",
  "narration": "The heavy door thuds closed, cutting off the draft from the corridor."
}
```

**3) Multi-target damage (AoE / multi-hit)**

```json
{
  "actors": [
    {"id":"wraith1","hp":55},
    {"id":"wraith3","hp":51}
  ],
  "last_action": "✨ Caelin blasts two wraiths (−12 total).",
  "lastAction": "✨ Caelin blasts two wraiths (−12 total).",
  "narration": "Twin flashes of force ripple through the crypt like thunder with no sound."
}
```

**4) Removal / defeated**

```json
{
  "actors": [{"id":"wraith2","hp":0,"effects":["defeated"],"deleted":true}],
  "last_action": "☠️ Wraith 2 defeated.",
  "lastAction": "☠️ Wraith 2 defeated.",
  "narration": "The last shred of shadow unravels into nothing."
}
```

### Example: Magic Missile

* `lich.hp: 135 → 123`
* `last_action: "✨ Caelin casts Magic Missile, hitting the Lich for 12 force damage."`
* `narration: "...three darts of blue light..."`

## Known Pitfalls We’ve Already Hit (and why they’re important)

### Schema drift (snake_case vs camelCase)

We saw that `last_action` updated but `lastAction` didn’t, which indicated:

* backend persistence was working for the new schema
* legacy keys were being overwritten/reintroduced somewhere in the merge path

**Design conclusion:** pick a canonical schema (snake_case) and tolerate legacy keys only as read-compat.

### “Looks updated in the UI but not in DB”

We learned to treat it as one of:

* the merge routine refusing a change (schema mismatch or blocked fields)
* caching/stale reads
* writing to one key but rendering another

**Design conclusion:** always verify:

* what the GPT outputs
* what the backend actually persists
* what the client renders

### Optional diagnostic mode (future)

For debugging live sessions, reserve a flag like:

```json
{ "debug": true }
```

When enabled, the DM view can display extra verification data (e.g., last GET version, last PUT version, and a compact diff of the most recent patch) to pinpoint desyncs quickly.

## End-State Experience (What we’re aiming for)

### What players see

* A clean battlemat web page showing the live encounter
* Tokens moving, HP changing, doors opening, obstacles blocking
* A short “last action” line and a growing narration section

### What the owner does

* Minimal typing: short action prompts to GPT
* Occasional adjudication / overrides

### What the GPT does

* Rules resolution + narration + state update
* Calls distance/path APIs to avoid handwaving
* Loads canonical POI templates and instantiates campaign state

---

## Example “Canonical Map on First Entry” Scenario

* Campaign enters POI: **Cross Keys Inn — Common Room**
* System creates a battle/scene instance from the inn template
* During a brawl:

  * chairs get knocked over (objects added)
  * NPCs move
  * a door is barred (door state toggled)
* Party leaves, returns days later:

  * the room is still in the aftermath state (unless cleaned/reset intentionally)

---

## Summary

We’re building a **stateful, GPT-driven VTT** where:

* the **database** is the source of truth
* the **battlemat client** renders and polls
* the **GPT** resolves actions and updates canonical JSON
* canonical POI templates become **campaign-persistent instances**
* one operator types, everyone else participates naturally via voice
