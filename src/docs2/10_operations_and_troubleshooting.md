# Battlemat3 Operations and Troubleshooting

Version: v1.00  
Updated: 2026-02-10

## Operational Principles

1. Keep `battlemat_next` unchanged as fallback baseline.
2. Prefer minimal, reversible changes.
3. Validate after each micro-batch in browser before stacking risk.

## Incident: Black Screen / Blackout

Symptoms:

1. canvas/host appears blank or mostly black after refresh

Checks:

1. browser console for runtime exceptions
2. network tab for failed `main.js` or module loads
3. confirm `battlemat3.html` still references `/app/battlemat3/main.js`
4. confirm tool and canvas IDs still exist

Actions:

1. rollback last micro-batch
2. retest previous known-good snapshot
3. reapply in smaller slice

## Incident: Chat Fetch Failed

Symptoms:

1. console warning from `modules/chat.js`
2. chat log stops updating

Checks:

1. `/api/messages` response code
2. `campaign_id` present and valid
3. auth headers present when required

Actions:

1. confirm `getCampaignId()` resolution path
2. verify poll interval loop still active
3. retest send and poll flows

## Incident: Save Fails (`DB: error`)

Checks:

1. battle id query key present
2. PUT request to `/api/battles/:battle_id` returns success
3. payload contains `state_json`
4. auth token query key and header if endpoint requires auth

Actions:

1. inspect request payload shape
2. verify wrapper record preservation logic when wrapper mode is active
3. retry after resolving backend response issue

## Incident: Undo Behaves Unexpectedly

Checks:

1. ensure `pushHistory()` is called once per intended mutation unit
2. ensure undo controls are bound once
3. verify repeat guard in `modules/history.js` for Ctrl/Cmd+Z (`ev.repeat`)

Actions:

1. reproduce with button and keyboard separately
2. identify whether issue is duplicate history push or duplicate undo trigger
3. fix in smallest parity-safe slice

## Useful Local Commands

1. `git status --short`
2. `git diff -- public/app/battlemat3/main.js`
3. `git diff -- public/app/battlemat3/modules/history.js`
4. `npm run test:battlemat3`
5. `rg -n "fetch\\(|localStorage\\.|getQueryParams\\(\\)\\.get" public/app/battlemat3`

