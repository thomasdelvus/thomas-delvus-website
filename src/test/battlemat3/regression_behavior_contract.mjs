import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mainPath = path.join(root, "public", "app", "battlemat3", "main.js");
const historyPath = path.join(root, "public", "app", "battlemat3", "modules", "history.js");

function fail(message) {
  console.error(`[regression_behavior_contract] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[regression_behavior_contract] PASS: ${message}`);
}

function read(filePath) {
  if (!fs.existsSync(filePath)) fail(`Missing file: ${filePath}`);
  return fs.readFileSync(filePath, "utf8");
}

function assertPattern(text, pattern, label) {
  if (!pattern.test(text)) fail(label);
  pass(label);
}

const mainJs = read(mainPath);
const historyJs = read(historyPath);

assertPattern(
  mainJs,
  /const\s+MOVEMENT\s*=\s*\{[\s\S]*?tickMs:\s*250,[\s\S]*?speedPerTick:\s*GRID\.size\s*\*\s*0\.375[\s\S]*?\}/,
  "movement cadence contract (250ms / 0.375*GRID)",
);

assertPattern(
  mainJs,
  /const\s+destinationHex\s*=\s*worldToHex\(world\);\s*const\s+destinationWorld\s*=\s*hexToWorld\(destinationHex\.col,\s*destinationHex\.row\);\s*const\s+moved\s*=\s*queueTokenMoveToWorld\(current\.item,\s*destinationWorld,\s*floor\);/,
  "click-to-move destination snap-to-hex contract",
);

assertPattern(
  mainJs,
  /const\s+opening\s*=\s*\{[\s\S]*?kind:\s*openingKind,[\s\S]*?floorId:\s*floor\.id,[\s\S]*?openPct:\s*0[\s\S]*?\};[\s\S]*?if\s*\(openingKindCategory\(\{\s*kind:\s*openingKind\s*\}\)\s*===\s*'door'\)\s*\{\s*opening\.state\s*=\s*'locked';/,
  "new door default locked + opening floorId contract",
);

assertPattern(
  mainJs,
  /Path blocked by \$\{blockerLabel\}\. Waiting for DM\./,
  "blocked path DM wait message contract",
);

assertPattern(
  mainJs,
  /setMoveBlockedCue\(/,
  "blocked path visual cue contract",
);

assertPattern(
  mainJs,
  /const\s+MOVEMENT\s*=\s*\{[\s\S]*?geometryCache:\s*new\s+Map\(\)[\s\S]*?\}/,
  "movement geometry cache container contract",
);

assertPattern(
  mainJs,
  /function\s+getMovementPortalWindowsCached\(floor,\s*step\)/,
  "movement portal-window cache helper present",
);

assertPattern(
  mainJs,
  /const\s+cached\s*=\s*getMovementPortalWindowsCached\(floor,\s*step\);[\s\S]*?const\s+walls\s*=\s*Array\.isArray\(cached\.walls\)\s*\?\s*cached\.walls\s*:\s*\[\]/,
  "buildMovementModel consumes cached movement geometry",
);

assertPattern(
  mainJs,
  /if\s*\(dy\s*<\s*-0\.0001\)\s*row\s*=\s*Math\.floor\(rowf\);\s*else\s+if\s*\(dy\s*>\s*0\.0001\)\s*row\s*=\s*Math\.ceil\(rowf\);/,
  "half-row directional rounding contract for blocked stops",
);

assertPattern(
  mainJs,
  /directionalBias:\s*!!\(pathResult\s*&&\s*pathResult\.partial\)/,
  "blocked-stop directional bias is applied only for partial routes",
);

assertPattern(
  mainJs,
  /showPathfindingStatus\s*=\s*!!saveStatus\s*&&\s*solveElapsedMs\s*>\s*150/,
  "pathfinding latency threshold contract (>150ms)",
);

assertPattern(
  mainJs,
  /`Pathfinding\.\.\. \$\{Math\.round\(solveElapsedMs\)\}ms`/,
  "pathfinding latency status message contract",
);

assertPattern(
  mainJs,
  /function\s+movementRoomsWithOpenings\(floor\)/,
  "movement opening-room fallback wall contract helper present",
);

assertPattern(
  mainJs,
  /for\s*\(const\s+opening\s+of\s+filterAlive\(floor\.openings\s*\|\|\s*\[\]\)\)/,
  "opening-room fallback scans live openings",
);

assertPattern(
  mainJs,
  /if\s*\(!roomHasWalls\(room\)\s*&&\s*!forcedByOpening\)\s*continue;/,
  "movement wall inclusion uses opening-forced fallback",
);

assertPattern(
  historyJs,
  /function\s+normalizeOpeningsForSave\(battle\)/,
  "save-time opening normalization helper present",
);

assertPattern(
  historyJs,
  /function\s+prepareBattleForSave\(battle\)\s*\{[\s\S]*?normalizeOpeningsForSave\(clean\);[\s\S]*?return\s+clean;/,
  "prepareBattleForSave applies opening normalization",
);

assertPattern(
  historyJs,
  /opening\.state\s*=\s*normalizedState;\s*opening\.lock_state\s*=\s*normalizedState;/,
  "opening state/lock_state sync contract",
);

console.log("[regression_behavior_contract] COMPLETE");
