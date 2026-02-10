import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextPath = path.join(root, "public", "app", "battlemat_next.html");
const v3Path = path.join(root, "public", "app", "battlemat3.html");

function fail(message) {
  console.error(`[parity_dom_contract] FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[parity_dom_contract] PASS: ${message}`);
}

function read(filePath) {
  if (!fs.existsSync(filePath)) fail(`Missing file: ${filePath}`);
  return fs.readFileSync(filePath, "utf8");
}

function extractIds(html) {
  return new Set(Array.from(html.matchAll(/id="([^"]+)"/g), (m) => m[1]));
}

function normalizeMojibake(text) {
  let out = text;
  const fixes = [
    [/\u00e2\u2020\u2018/g, "\u2191"],
    [/\u00e2\u2020\u0090/g, "\u2190"],
    [/\u00e2\u2020\u2019/g, "\u2192"],
    [/\u00e2\u2020\u201c/g, "\u2193"],
    [/\u00e2\u02c6\u2019/g, "\u2212"],
    [/\u00e2\u2013\u00be/g, "\u25be"],
    [/\u00e2\u20ac\u201c/g, "\u2013"],
    [/\u00e2\u0153\u201c/g, "\u2713"],
    [/\u00c2\u00b0/g, "\u00b0"],
  ];
  for (const [pattern, replacement] of fixes) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

function extractButtonLabels(html) {
  const labels = Array.from(
    html.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g),
    (m) => normalizeMojibake(m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()),
  );
  return labels;
}

const nextHtml = read(nextPath);
const v3Html = read(v3Path);

const nextIds = extractIds(nextHtml);
const v3Ids = extractIds(v3Html);

const missingInV3 = [...nextIds].filter((id) => !v3Ids.has(id));
const extraInV3 = [...v3Ids].filter((id) => !nextIds.has(id));

if (missingInV3.length) fail(`IDs missing in battlemat3.html: ${missingInV3.join(", ")}`);
if (extraInV3.length) fail(`Extra IDs in battlemat3.html: ${extraInV3.join(", ")}`);
pass(`ID set parity (${nextIds.size} IDs)`);

const nextButtons = extractButtonLabels(nextHtml);
const v3Buttons = extractButtonLabels(v3Html);
if (nextButtons.length !== v3Buttons.length) {
  fail(`Button count differs: next=${nextButtons.length}, v3=${v3Buttons.length}`);
}
for (let i = 0; i < nextButtons.length; i += 1) {
  if (nextButtons[i] !== v3Buttons[i]) {
    fail(`Button label mismatch at index ${i}: next="${nextButtons[i]}", v3="${v3Buttons[i]}"`);
  }
}
pass(`Button label order parity (${nextButtons.length} buttons)`);

if (!/src="\/app\/battlemat3\/main\.js"/.test(v3Html)) {
  fail("battlemat3.html does not load /app/battlemat3/main.js");
}
pass("Script wiring to /app/battlemat3/main.js");

console.log("[parity_dom_contract] COMPLETE");
