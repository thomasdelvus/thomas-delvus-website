# Battlemat Autonomy Policy Matrix

Version: v0.1  
Updated: 2026-02-13

## Purpose

Define which player actions are allowed without DM/GPT intervention, which actions must pause for DM review, and which actions are blocked.

This matrix is designed for a queued-intent model:

1. Player submits an action intent.
2. Engine evaluates policy + triggers.
3. Action is auto-resolved or moved to a DM gate.
4. GPT run processes pending gates and narrates outcomes.

## Policy Levels

1. `AUTO`: execute immediately, log event.
2. `AUTO_LOG_ONLY`: execute immediately, hide from player chat feed if needed, retain in event log.
3. `GATE_DM`: stop and show `Waiting for DM`.
4. `DENY`: reject action client-side.

## Action Matrix

| Domain | Player Action | Default Policy | Gate Conditions | Engine Requirements | Notes |
|---|---|---|---|---|---|
| Movement | Move token along computed path in known public area | `AUTO_LOG_ONLY` | Entering unknown zone, hostile LOS, trap trigger, scripted area, restricted region | Deterministic pathing, per-step trigger checks, collision checks | BG-style click-to-move target use case |
| Movement | Sprint/forced movement in non-combat | `GATE_DM` | Always | Resource/time checks | Prevent abuse outside turn economy |
| Movement | Enter interior/building | `GATE_DM` | Always unless zone marked safe | Zone metadata lookup | Good choke point for scene transitions |
| Movement | Cross floor transition/stairs | `GATE_DM` | Always | Floor link validation | Often implies narrative or encounter change |
| Interaction | Open unlocked safe door/window | `AUTO` | If door has trap/lock/script | Door metadata + trigger checks | Should feel immediate |
| Interaction | Open locked/barred/trapped door | `GATE_DM` | Always | Skill/check pipeline | Requires adjudication |
| Interaction | Inspect obvious POI (sign, marker, static clue) | `AUTO` | If POI flagged hidden/scripted | POI visibility rules | Can produce short auto text |
| Interaction | Loot contested/sensitive container | `GATE_DM` | Always | Ownership + encounter checks | High exploit risk |
| Interaction | Rearrange own token facing/stance marker | `AUTO` | None | Token ownership validation | Cosmetic/gameplay prep |
| Social | Local RP chat/emotes | `AUTO` | None | Sanitization + rate limit | Visible to players immediately |
| Social | NPC dialog initiation | `GATE_DM` | Always | NPC proximity/availability checks | Starts branchable content |
| Combat | Target selection ping | `AUTO` | None | Visibility/range helper only | Non-binding |
| Combat | Attack/cast/use ability | `GATE_DM` | Always until deterministic combat tools are complete | Turn legality, range/LOS, resource checks | Promote to `AUTO` later by ruleset |
| Combat | End turn | `AUTO` | If unresolved reactions/triggers exist | Turn-state validator | Can still create DM gate on conflicts |
| State | Add custom map annotation by player | `AUTO` | If annotation in restricted layer | Layer ACL checks | Store as player-owned metadata |
| State | Edit geometry (rooms/roofs/openings) | `DENY` | Always for non-editor mode | Editor mode check | Reserved for DM/editor |

## Trigger Classes (Pause to DM)

Any of these should convert an `AUTO`/`AUTO_LOG_ONLY` action into `GATE_DM`:

1. `hostile_contact`: hostile enters LOS/range threshold.
2. `unknown_interior`: token crosses into unexplored interior zone.
3. `scripted_zone`: region has scripted entry event.
4. `trap_or_lock`: door/container interaction has lock/trap flag.
5. `resource_conflict`: action needs spell slot, item charge, limited use, or time skip approval.
6. `authority_conflict`: action targets entity/object not owned by acting player.

## Queue/Event Contract (Recommended)

### Intent Queue Record

```json
{
  "intent_id": "intent_01",
  "actor_id": "entity_sera",
  "type": "move",
  "payload": { "to_hex": "AB14" },
  "submitted_at": "2026-02-13T08:10:00Z",
  "status": "pending"
}
```

### Resolved Event Record

```json
{
  "event_id": "evt_01",
  "intent_id": "intent_01",
  "type": "move.resolved",
  "visibility": "hidden",
  "requires_dm": false,
  "summary": "Sera moved from AA10 to AB14",
  "created_at": "2026-02-13T08:10:02Z"
}
```

### Gate Record

```json
{
  "gate_id": "gate_01",
  "intent_id": "intent_02",
  "reason": "hostile_contact",
  "status": "waiting_dm",
  "created_at": "2026-02-13T08:11:00Z"
}
```

## UI Behavior in Play Mode

1. Player clicks destination.
2. Token animates along path while action remains policy-allowed.
3. On first gate trigger:
   1. stop movement immediately
   2. display `Waiting for DM`
   3. retain remaining path as pending/aborted context

## Rollout Plan

1. Phase A: enable `AUTO_LOG_ONLY` movement in explicitly safe zones only.
2. Phase B: enable safe door interactions and map annotations.
3. Phase C: add deterministic combat tool actions and gradually reclassify selective combat actions from `GATE_DM` to `AUTO`.
