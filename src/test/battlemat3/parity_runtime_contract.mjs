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
const v3Js = read(v3JsPath);

const lsRegex = /localStorage\.(?:getItem|setItem)\('([^']+)'\)/g;
const qpRegex = /(?:qp\.get|getQueryParams\(\)\.get)\('([^']+)'\)/g;
const fetchRegex = /fetch\(([^)]+)\)/g;

const nextLs = extractSet(nextJs, lsRegex);
const v3Ls = extractSet(v3Js, lsRegex);
const nextQp = extractSet(nextJs, qpRegex);
const v3Qp = extractSet(v3Js, qpRegex);
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

if (!/method:\s*'PUT'[\s\S]*?\/api\/battles\/\$\{encodeURIComponent\(battleId\)\}/.test(v3Js)) {
  fail("Full-state battle PUT contract not found");
}
pass("Full-state battle PUT contract present");

if (!/setInterval\(pollChat,\s*3000\)/.test(v3Js)) {
  fail("Chat poll interval contract (3000ms) not found");
}
pass("Chat polling interval contract present");

if (!/PATCH[\s\S]*\/api\/campaigns\/\$\{encodeURIComponent\(cid\)\}\/entities/.test(v3Js)) {
  fail("Campaign entity PATCH contract not found");
}
pass("Campaign entity PATCH contract present");

console.log("[parity_runtime_contract] COMPLETE");
