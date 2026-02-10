# Battlemat3 Runtime Architecture

Version: v1.00  
Updated: 2026-02-10

## High-Level Design

`battlemat3` uses a single runtime (`main.js`) with extracted controllers for cross-cutting behavior:

1. Contracts and query/auth utilities.
2. Preference persistence and section collapse behavior.
3. Battle/campaign load and normalization.
4. Chat polling/send/merge/render workflow.
5. History snapshot and undo controls.

The runtime remains behavior-compatible with `battlemat_next`, but code ownership is cleaner.

## Module Responsibilities

1. `modules/contracts.js`
   1. `getQueryParams`
   2. `escapeHtml`
   3. `normStr`
   4. `getAuthHeaders`
2. `modules/prefs.js`
   1. `loadPrefs`
   2. `savePrefs`
   3. `initSectionCollapse`
3. `modules/api.js`
   1. state normalization and extraction
   2. battle/campaign/map loading
   3. POI resolution
4. `modules/chat.js`
   1. chat speaker options
   2. message merge/render
   3. poll loop and send
5. `modules/history.js`
   1. snapshot/restore/undo stack
   2. save payload cleanup helper
   3. undo button + keyboard binding

## Runtime Lifecycle

`init()` sequence in `main.js`:

1. `loadBattle()`
2. `loadCampaign()`
3. `loadPrefs()`
4. `initSectionCollapse()`
5. `setFloorOptions()`
6. `populateKindLists()`
7. `loadMapOptions()`
8. camera/zoom init
9. `pushHistory()` baseline snapshot
10. `renderStatus()`
11. `attachEvents()`
12. `render()`
13. `startChatPolling()`

## Control Ownership

1. `main.js` owns:
   1. geometry/math helpers
   2. rendering pipeline
   3. selection/edit operations
   4. save/entity patch operations
2. modules own:
   1. generic concerns that can be isolated from rendering and geometry

## Error Handling Model

1. Battle save failures:
   1. update status label to `DB: error`
2. Chat failures:
   1. warn in console and continue polling cycle
3. Entity patch failures:
   1. soft-fail with swallowed fetch errors to avoid editor interruption
4. Init failure:
   1. status set to `DB: error`
   2. error logged to console

## Architectural Invariants

1. `battlemat_next` remains untouched.
2. `battlemat3.html` DOM ID surface stays parity-compatible.
3. API endpoint and query-key usage remains contract-compatible.
4. Side effects remain explicit in event handlers and save/poll paths.

