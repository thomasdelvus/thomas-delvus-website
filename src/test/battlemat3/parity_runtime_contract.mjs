import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextHtmlPath = path.join(root, "public", "app", "battlemat_next.html");
const v3JsPath = path.join(root, "public", "app", "battlemat3", "main.js");

function fail(message) {
  console.error(`[parity_runtime_contract] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[parity_runtime_contract] PASS: ${message}`);
}

function read(filePath) {
  if (!fs.existsSync(filePath)) fail(`Missing file: ${filePath}`);
  return fs.readFileSync(filePath, "utf8");
}

function extractInlineScript(html) {
  const match = html.match(/<script>\s*([\s\S]*?)\s*<\/script>/);
  if (!match) fail("Could not locate inline script in battlemat_next.html");
  return match[1];
}

function extractSet(text, regex, group = 1) {
  return new Set(Array.from(text.matchAll(regex), (m) => m[group]));
}

const nextHtml = read(nextHtmlPath);
const nextJs = extractInlineScript(nextHtml);
const v3MainJs = read(v3JsPath);
const v3RuntimeParts = [v3MainJs];
const importedModuleRegex = /from\s+['"]\.\/modules\/([^'"]+)['"]/g;
for (const match of v3MainJs.matchAll(importedModuleRegex)) {
  const rel = match[1];
  const abs = path.join(root, "public", "app", "battlemat3", "modules", rel);
  if (!fs.existsSync(abs)) fail(`Missing imported module: ${abs}`);
  v3RuntimeParts.push(read(abs));
}
const v3Js = v3RuntimeParts.join("\n");

const lsRegex = /localStorage\.(?:getItem|setItem)\((['"])([^'"]+)\1\)/g;
const qpRegex = /(?:qp\.get|getQueryParams\(\)\.get)\((['"])([^'"]+)\1\)/g;
const fetchRegex = /fetch\(([^)]+)\)/g;

const nextLs = extractSet(nextJs, lsRegex, 2);
const v3Ls = extractSet(v3Js, lsRegex, 2);
const nextQp = extractSet(nextJs, qpRegex, 2);
const v3Qp = extractSet(v3Js, qpRegex, 2);
const nextFetch = extractSet(nextJs, fetchRegex, 1);
const v3Fetch = extractSet(v3Js, fetchRegex, 1);

function assertSetParity(label, a, b) {
  const missing = [...a].filter((item) => !b.has(item));
  const extra = [...b].filter((item) => !a.has(item));
  if (missing.length) fail(`${label} missing in battlemat3: ${missing.join(", ")}`);
  if (extra.length) fail(`${label} extra in battlemat3: ${extra.join(", ")}`);
  pass(`${label} parity (${a.size})`);
}

assertSetParity("localStorage keys", nextLs, v3Ls);
assertSetParity("query params", nextQp, v3Qp);
assertSetParity("fetch call sites", nextFetch, v3Fetch);

const hasBattlePutEndpoint = /\/api\/battles\/\$\{encodeURIComponent\(battleId\)\}/.test(v3Js);
const hasBattlePutMethod = /method:\s*['"]PUT['"]/.test(v3Js);
if (!hasBattlePutEndpoint || !hasBattlePutMethod) {
  fail("Full-state battle PUT contract not found");
}
pass("Full-state battle PUT contract present");

if (!/setInterval\(pollChat,\s*3000\)/.test(v3Js)) {
  fail("Chat poll interval contract (3000ms) not found");
}
pass("Chat polling interval contract present");

const hasEntityPatchEndpoint = /\/api\/campaigns\/\$\{encodeURIComponent\(cid\)\}\/entities/.test(v3Js);
const hasEntityPatchMethod = /method:\s*['"]PATCH['"]/.test(v3Js);
if (!hasEntityPatchEndpoint || !hasEntityPatchMethod) {
  fail("Campaign entity PATCH contract not found");
}
pass("Campaign entity PATCH contract present");

console.log("[parity_runtime_contract] COMPLETE");
