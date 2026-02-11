# Battlemat3 Rendering Pipeline

Version: v1.01  
Updated: 2026-02-11

## Overview

Rendering is canvas-based and composited from named offscreen layer canvases, then drawn into `#map`.

## Layer Context Allocation

`getLayerContext(name, rect, dpr)` manages layer canvases in `LAYER_CANVASES`:

1. creates layer canvas lazily on first use
2. sizes canvas to viewport and DPR
3. clears and returns `{ canvas, ctx }`

## Render Entry

`render()` performs:

1. guard on missing `STATE.battle`
2. compute effective DPR (`devicePixelRatio * videoScale`)
3. size and clear main canvas
4. resolve active floor
5. obtain all required layer contexts
6. compute fog/reveal room sets
7. draw world layers
8. composite selected layers to main canvas

## Draw Ordering (All Layers Mode)

Primary order:

1. floors
2. objects pass 1 (regular openings + non-POI objects)
3. fog overlay (explored rooms)
4. walls
5. roofs
6. roof shadows (multiply blend)
7. tokens pass (tokens + door/window style openings + POI objects)
8. grid (if enabled)
9. handles/selection overlays

This order is critical for parity of visual readability and interaction affordances.

## Fog-Aware Rendering

Visibility is computed before draw:

1. classify rooms into visible/explored/hidden
2. hide objects/tokens/openings in hidden areas
3. apply explored overlay alpha on explored rooms

Street-segment rooms can auto-reveal adjacent rooms based on active PC positions.

## Texture and Sprite Handling

1. Sprite images are cached by URL.
2. Loading/error triggers rerender.
3. Unknown or failed assets fall back to primitive rendering behavior already defined in runtime.

## Roof Weathering Pass (Phase 2)

`drawRoofPoly()` now supports deterministic weathering overlays driven by `roof.weathering`.

1. `roof.weathering.seed` (fallback: `roof.id`) is hashed to generate stable noise maps.
2. Generated roof weather maps are cached (`ROOF_WEATHER_MAP_CACHE`) and reused.
3. Per-render canvas patterns are cached per context (`ROOF_WEATHER_PATTERN_CACHE`).
4. Overlay channels:
   1. `aging`
   2. `moss`
   3. `mottlingDark`
   4. `mottlingLight`
   5. `streaks`
   6. `repairs`
5. Channel strength is controlled by normalized `roof.weathering` values (0..1).
6. With all controls at `0`, behavior is visually unchanged (no-op weathering pass).

## Performance Characteristics

Current behavior:

1. full redraw on each render trigger
2. per-render layer canvas resize to viewport and DPR
3. caching for sprite image objects and texture patterns

Refactor objective:

1. keep behavior parity while reducing redundant render/canvas churn where safe.
