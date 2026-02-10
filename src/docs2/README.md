# Battlemat3 Documentation Set

Version: v1.00  
Updated: 2026-02-10

This folder is the consolidated documentation for the battlemat3 refactor track.
It is intended to replace ad-hoc discovery across `src/docs/*` with one coherent set.

## Audience

1. Developers implementing parity-safe refactors.
2. QA validating behavior parity between battlemat_next and battlemat3.
3. Operators troubleshooting runtime/API issues.

## Document Map

1. `src/docs2/01_project_charter.md`
2. `src/docs2/02_system_topology.md`
3. `src/docs2/03_runtime_architecture.md`
4. `src/docs2/04_state_and_data_model.md`
5. `src/docs2/05_api_contracts.md`
6. `src/docs2/06_rendering_pipeline.md`
7. `src/docs2/07_tools_interactions_and_undo.md`
8. `src/docs2/08_chat_status_and_entity_sync.md`
9. `src/docs2/09_testing_and_parity.md`
10. `src/docs2/10_operations_and_troubleshooting.md`
11. `src/docs2/11_migration_status_and_next_steps.md`
12. `src/docs2/12_reference_source_map.md`
13. `src/docs2/13_behavior_contract_catalog.md`

## Quick Start

1. Read `01_project_charter.md` for scope and constraints.
2. Read `03_runtime_architecture.md` and `06_rendering_pipeline.md` for code-level design.
3. Use `09_testing_and_parity.md` before and after each change set.
4. Use `10_operations_and_troubleshooting.md` during incidents.

## Canonical Runtime Files

1. `public/app/battlemat_next.html` (parity baseline, unchanged)
2. `public/app/battlemat3.html` (new host)
3. `public/app/battlemat3/main.js` (primary runtime)
4. `public/app/battlemat3/modules/contracts.js`
5. `public/app/battlemat3/modules/prefs.js`
6. `public/app/battlemat3/modules/api.js`
7. `public/app/battlemat3/modules/chat.js`
8. `public/app/battlemat3/modules/history.js`
