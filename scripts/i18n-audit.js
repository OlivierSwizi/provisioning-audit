// FILENAME: scripts/i18n-audit.js
/* eslint-disable no-console */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd());
const SRC_DIR = path.join(ROOT, "src");
const LOCALES_DIRS = [path.join(ROOT, "public", "locales"), path.join(ROOT, "src", "locales")];

const CODE_GLOBS = [".js", ".jsx"]; // étends si besoin

// --- Utils ----------------------------------------------------
function walk(dir, filterExts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (!filterExts || filterExts.some((ext) => p.endsWith(ext))) out.push(p);
    }
  }
  return out;
}

function readJSONSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function flattenKeys(obj, prefix = "") {
  const keys = [];
  if (!obj || typeof obj !== "object") return keys;
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") keys.push(...flattenKeys(v, next));
    else keys.push(next);
  }
  return keys;
}

// --- 1) Collecte des clés utilisées dans le code -----------------------------
const tCallRegex = /\b(?:i18n\.)?t\(\s*(['"`])([^'"`]+)\1/g; // t('key') ou i18n.t("key")
const usedKeys = new Set();

for (const file of walk(SRC_DIR, CODE_GLOBS)) {
  const code = fs.readFileSync(file, "utf8");
  let m;
  while ((m = tCallRegex.exec(code))) {
    const key = m[2].trim();
    if (key) usedKeys.add(key);
  }
}

// --- 2) Collecte des clés déclarées dans les locales -------------------------
const localeFiles = [];
for (const base of LOCALES_DIRS) {
  if (!fs.existsSync(base)) continue;
  for (const lang of walk(base)) {
    if (lang.endsWith(".json")) localeFiles.push(lang);
  }
}

const declaredKeys = new Set();
const perLang = {}; // { fr: Set(keys), en: Set(keys) ... }

for (const lf of localeFiles) {
  const rel = path.relative(ROOT, lf);
  const data = readJSONSafe(lf);
  if (!data) continue;
  const keys = flattenKeys(data);
  const lang = (() => {
    // déduit la langue depuis .../locales/<lang>/xxx.json ou <lang>.json
    const parts = lf.split(path.sep);
    const idx = parts.lastIndexOf("locales");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    const base = path.basename(lf, ".json");
    return base; // fallback
  })();

  if (!perLang[lang]) perLang[lang] = new Set();
  for (const k of keys) {
    declaredKeys.add(k);
    perLang[lang].add(k);
  }
}

// --- 3) Diff : missing / unused ---------------------------------------------
const missing = [];
for (const k of usedKeys) {
  if (!declaredKeys.has(k)) missing.push(k);
}

const unused = [];
for (const k of declaredKeys) {
  if (!usedKeys.has(k)) unused.push(k);
}

// --- 4) Stats de préfixes pour t’aider à uniformiser usr./grp./his./common. --
function prefixOf(key) {
  const i = key.indexOf(".");
  return i > 0 ? key.slice(0, i) : key;
}

const prefixStatsUsed = {};
for (const k of usedKeys) {
  const p = prefixOf(k);
  prefixStatsUsed[p] = (prefixStatsUsed[p] || 0) + 1;
}

const prefixStatsDeclared = {};
for (const k of declaredKeys) {
  const p = prefixOf(k);
  prefixStatsDeclared[p] = (prefixStatsDeclared[p] || 0) + 1;
}

// --- 5) Sorties --------------------------------------------------------------
const REPORT_DIR = path.join(ROOT, "reports");
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR);
const OUT = path.join(REPORT_DIR, "i18n-audit.json");

const result = {
  summary: {
    usedCount: usedKeys.size,
    declaredCount: declaredKeys.size,
    missingCount: missing.length,
    unusedCount: unused.length,
    langs: Object.keys(perLang),
  },
  missing: missing.sort(),
  unused: unused.sort(),
  prefixStats: {
    used: Object.fromEntries(Object.entries(prefixStatsUsed).sort((a, b) => b[1] - a[1])),
    declared: Object.fromEntries(Object.entries(prefixStatsDeclared).sort((a, b) => b[1] - a[1])),
  },
  perLangCounts: Object.fromEntries(Object.entries(perLang).map(([lang, set]) => [lang, set.size])),
};

fs.writeFileSync(OUT, JSON.stringify(result, null, 2), "utf8");
console.log(`i18n audit done → ${path.relative(ROOT, OUT)}`);
console.log(JSON.stringify(result.summary, null, 2));
