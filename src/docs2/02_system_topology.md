# Battlemat3 System Topology

Version: v1.00  
Updated: 2026-02-10

## Runtime Entry Points

1. Browser route:
   1. `src/pages/play3/[battle_id].astro`
   2. Redirects to `/app/battlemat3.html?battle_id={id}`
2. Host document:
   1. `public/app/battlemat3.html`
   2. Loads `<script type="module" src="/app/battlemat3/main.js">`
3. Baseline document:
   1. `public/app/battlemat_next.html`
   2. Baseline for parity verification only.

## Frontend Runtime Composition

1. Core runtime:
   1. `public/app/battlemat3/main.js`
2. Controllers:
   1. `public/app/battlemat3/modules/contracts.js`
   2. `public/app/battlemat3/modules/prefs.js`
   3. `public/app/battlemat3/modules/api.js`
   4. `public/app/battlemat3/modules/chat.js`
   5. `public/app/battlemat3/modules/history.js`

## Data and API Dependencies

1. Battle state:
   1. `GET /api/battles/:battle_id`
   2. `PUT /api/battles/:battle_id`
2. Campaign metadata and entities:
   1. `GET /api/campaigns/:campaign_id`
   2. `PATCH /api/campaigns/:campaign_id/entities`
3. Chat:
   1. `GET /api/messages`
   2. `POST /api/messages`

## Internal Supporting Assets

1. Fixture references:
   1. `src/docs/JSON_CrossKeys.JSON`
   2. `src/docs/JSON_SaffrondaleStreets.JSON`
2. Sprite/texture paths are resolved under `/assets` and `/images` from runtime constants.

## Test Topology

1. Contract tests:
   1. `src/test/battlemat3/parity_dom_contract.mjs`
   2. `src/test/battlemat3/parity_runtime_contract.mjs`
2. Test runner:
   1. `src/test/battlemat3/run.mjs`
3. Package command:
   1. `npm run test:battlemat3`

