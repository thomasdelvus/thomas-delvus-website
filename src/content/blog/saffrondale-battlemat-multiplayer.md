---
title: "Saffrondale Battlemat: Multiplayer Foundations"
description: "Laying the groundwork for shared play, characters, and access control."
pubDate: "Jan 28 2026"
heroImage: "/images/battlemat_dev.jpg"
project: "saffrondale"
---

The battlemat is becoming the table, not a toy model. Multiplayer here isn’t just “two cursors on the same map,” it’s a shared world state with memory, ownership, and consequence. The engine is now centered on a canonical battle record that holds the scene, the map layers, fog, and the live token positions—so the table is one source of truth, not a handful of clients racing each other.

Three pillars are coming online in parallel:

1) **Shared state that survives the night.**  
   The map, the actors, and the turn state live in a durable record. It can be updated incrementally (safe merges, id-based patches) so a door opens, a token moves, a fog ring clears—without rewriting the entire world. That keeps the updates tight and the log clean.

2) **Characters with identity, not just tokens.**  
   The battlemat has started to point at real character IDs in the database. That means a token can be traced back to a sheet, notes, portrait, and player ownership. It stops being a local piece of UI and becomes a real citizen of the campaign.

3) **The player dashboard as a passport gate.**  
   I’m leaning on “player passports” for light authentication—enough to prove identity and link the right characters without making players fight the login flow. The dashboard is the home base: it’s where you see your characters, notes, and invitations, and it’s how the table knows who you are.

The aim is a world where identity is stable but access is frictionless. The rules and maps stay canonical; players arrive with their names, their sheets, and their history intact.

Next, I’m stitching the dashboard to the table so the handoff feels invisible: pick a campaign, the table wakes, your character appears. And beyond that, I’m teaching the world to handle split parties—so the battlemat can “flip” to the right POI based on whose turn it is, without losing the others in the fog.
