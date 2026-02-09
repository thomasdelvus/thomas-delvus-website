import { spawnSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const tests = [
  "src/test/battlemat3/parity_dom_contract.mjs",
  "src/test/battlemat3/parity_runtime_contract.mjs",
];

let failed = false;

for (const relPath of tests) {
  const absPath = path.join(root, relPath);
  const result = spawnSync(process.execPath, [absPath], {
    stdio: "inherit",
    cwd: root,
  });
  if (result.status !== 0) {
    failed = true;
  }
}

if (failed) {
  console.error("[battlemat3-tests] FAIL");
  process.exit(1);
}

console.log("[battlemat3-tests] PASS");
