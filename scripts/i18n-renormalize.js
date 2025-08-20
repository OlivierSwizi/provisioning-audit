// FILENAME: scripts/i18n-renormalize.js
/* eslint-disable no-console */
import fs from "fs";
import path from "path";

/**
 * Ce script :
 *  - lit scripts/i18n-prefixes.json
 *  - scanne src/***.{js,jsx} : t("...") / i18n.t("...")
 *  - construit un plan de renommage:
 *      • clés SANS point -> <prefix>.<key>
 *      • avec --reprefix, re-préfixe aussi les clés déjà "xxx.something" si le prefix attendu diffère (sauf common.*)
 *  - met à jour src/i18n/lang/fr/translation.json et src/i18n/lang/en/translation.json :
 *      • copie oldKey -> newKey (FR/EN), supprime oldKey
 *      • si oldKey n’existe pas en locales, FR = oldKey (fallback) et EN = FR
 *  - écrit:
 *      • scripts/i18n-keys-map.generated.json  (mapping old -> new)
 *      • reports/i18n-renormalize-plan.json   (plan + collisions + stats)
 *
 * Usage:
 *   node scripts/i18n-renormalize.js
 *   node scripts/i18n-renormalize.js --reprefix
 */

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const REPORTS_DIR = path.join(ROOT, "reports");
const PREFIX_CFG_PATH = path.join(ROOT, "scripts", "i18n-prefixes.json");

const FR_PATH = path.join(ROOT, "src", "i18n", "lang", "fr", "translation.json");
const EN_PATH = path.join(ROOT, "src", "i18n", "lang", "en", "translation.json");

const OUT_KEYS_MAP = path.join(ROOT, "scripts", "i18n-keys-map.generated.json");
const OUT_PLAN = path.join(REPORTS_DIR, "i18n-renormalize-plan.json");

const REPREFIX = process.argv.includes("--reprefix");

// ------------- utils FS
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });
const readJSON = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null);
const writeJSON = (p, obj) => fs.writeFileSync(p, JSON.stringify(obj, null, 2), "utf8");

// ------------- flatten / unflatten (safe)
function flatten(obj, prefix = "", out = {}) {
  if (obj === null || obj === undefined) {
    if (prefix) out[prefix] = obj;
    return out;
  }
  if (Array.isArray(obj)) {
    // On traite le tableau comme valeur feuille
    if (prefix) out[prefix] = obj;
    return out;
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0) {
      if (prefix) out[prefix] = obj;
      return out;
    }
    for (const [k, v] of entries) {
      const nk = prefix ? `${prefix}.${k}` : k;
      flatten(v, nk, out);
    }
    return out;
  }
  // primitif
  if (prefix) out[prefix] = obj;
  return out;
}

/**
 * unflattenSafe :
 *  - Reconstruit un arbre depuis des clés plates "a.b.c"
 *  - En cas de collision (clé parent déjà feuille), convertit en { "__value": <ancienne_valeur> }
 *    puis poursuit l’insertion.
 *  - Retourne { tree, collisions[] }
 */
function unflattenSafe(flat) {
  const root = {};
  const collisions = [];

  const setPath = (key, value) => {
    const parts = key.split(".");
    let cur = root;

    for (let i = 0; i < parts.length; i += 1) {
      const p = parts[i];

      // dernier segment → assignation
      if (i === parts.length - 1) {
        const existing = cur[p];
        if (
          existing !== undefined &&
          typeof existing === "object" &&
          existing !== null &&
          !Array.isArray(existing)
        ) {
          // déjà un objet → on écrase en douceur (ou on garde ? ici on remplace)
          cur[p] = value;
          return;
        }
        if (existing !== undefined && typeof existing !== "object") {
          // feuille → collision
          collisions.push({ type: "leaf_overwritten", key, previous: existing });
        }
        cur[p] = value;
        return;
      }

      // segment intermédiaire
      const next = cur[p];
      if (next === undefined) {
        cur[p] = {};
      } else if (typeof next !== "object" || next === null || Array.isArray(next)) {
        // collision: on veut descendre, mais c'est une feuille
        collisions.push({
          type: "parent_conflict",
          parentKey: parts.slice(0, i + 1).join("."),
          previous: next,
        });
        cur[p] = { __value: next };
      }
      cur = cur[p];
    }
  };

  for (const [k, v] of Object.entries(flat || {})) {
    if (!k) continue;
    setPath(k, v);
  }

  return { tree: root, collisions };
}

// ------------- tiny glob matcher (sans dépendances)
function matchGlob(fileAbs, globPatternAbs) {
  const f = fileAbs.replace(/\\/g, "/");
  const g = globPatternAbs
    .replace(/\\/g, "/")
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "(.+?)")
    .replace(/\*/g, "([^/]+?)");
  const re = new RegExp(`^${g}$`);
  return re.test(f);
}
function prefixForFile(fileAbs, cfg) {
  const patterns = cfg.patterns || [];
  for (const { glob, prefix } of patterns) {
    const abs = path.join(ROOT, glob);
    if (matchGlob(fileAbs, abs)) return prefix;
  }
  return cfg.default || "common";
}

// ------------- scan code for t("...") / i18n.t("...")
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", "build", "dist", "reports", "assets"].includes(e.name)) continue;
      walk(p, out);
    } else if (/\.(jsx?|tsx?)$/.test(e.name)) {
      out.push(p);
    }
  }
  return out;
}
const T_CALL = /\b(?:i18n\.)?t\(\s*(['"`])([^'"`]+)\1/g;

function collectKeysByFile() {
  const files = walk(SRC_DIR, []);
  const map = new Map(); // key -> Set(files)
  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");
    let m;
    while ((m = T_CALL.exec(code))) {
      const key = m[2].trim();
      if (!key) continue;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(file);
    }
  }
  return map;
}

// ------------- migration logic
function buildRenamePlan(keysToFiles, cfg, reprefix) {
  const plan = {}; // old -> new
  for (const [oldKey, files] of keysToFiles.entries()) {
    const sampleFile = Array.from(files)[0];
    const expectedPrefix = prefixForFile(sampleFile, cfg);

    const hasDot = oldKey.includes(".");
    if (!hasDot) {
      plan[oldKey] = `${expectedPrefix}.${oldKey}`;
      continue;
    }

    if (!reprefix) continue;

    const currentPrefix = oldKey.split(".")[0];
    if (currentPrefix === "common") continue;
    if (currentPrefix !== expectedPrefix) {
      const rest = oldKey.split(".").slice(1).join(".");
      plan[oldKey] = `${expectedPrefix}.${rest}`;
    }
  }
  return plan;
}

function migrateLocales(renamePlan, frFlat, enFlat) {
  const frNew = { ...frFlat };
  const enNew = { ...enFlat };

  for (const [oldKey, newKey] of Object.entries(renamePlan)) {
    // créer nouvelles valeurs si absentes
    if (frNew[newKey] === undefined) {
      frNew[newKey] = frNew[oldKey] !== undefined ? frNew[oldKey] : oldKey; // fallback FR = ancienne clé
    }
    if (enNew[newKey] === undefined) {
      enNew[newKey] = enNew[oldKey] !== undefined ? enNew[oldKey] : frNew[newKey]; // EN = ancien EN ou copie FR
    }
    // supprimer anciennes
    if (frNew[oldKey] !== undefined) delete frNew[oldKey];
    if (enNew[oldKey] !== undefined) delete enNew[oldKey];
  }

  return { frNew, enNew };
}

function main() {
  ensureDir(REPORTS_DIR);

  // 1) charge config
  const cfg = readJSON(PREFIX_CFG_PATH);
  if (!cfg || !Array.isArray(cfg.patterns)) {
    throw new Error(`Config invalide: ${PREFIX_CFG_PATH}`);
  }

  // 2) scan code
  const keysToFiles = collectKeysByFile();

  // 3) plan
  const renamePlan = buildRenamePlan(keysToFiles, cfg, REPREFIX);

  // 4) locales actuelles
  const frObj = readJSON(FR_PATH) || {};
  const enObj = readJSON(EN_PATH) || {};
  const frFlat = flatten(frObj);
  const enFlat = flatten(enObj);

  // 5) appliquer migration sur les maps plates
  const { frNew, enNew } = migrateLocales(renamePlan, frFlat, enFlat);

  // 6) unflatten SAFE + collisions
  const { tree: frTree, collisions: frCollisions } = unflattenSafe(frNew);
  const { tree: enTree, collisions: enCollisions } = unflattenSafe(enNew);

  // 7) écrire
  ensureDir(path.dirname(FR_PATH));
  ensureDir(path.dirname(EN_PATH));
  writeJSON(FR_PATH, frTree);
  writeJSON(EN_PATH, enTree);

  writeJSON(OUT_KEYS_MAP, renamePlan);
  writeJSON(OUT_PLAN, {
    summary: {
      uniqueKeysInCode: keysToFiles.size,
      renamedCount: Object.keys(renamePlan).length,
      reprefix: REPREFIX,
      frCollisions: frCollisions.length,
      enCollisions: enCollisions.length,
      locales: {
        fr: path.relative(ROOT, FR_PATH),
        en: path.relative(ROOT, EN_PATH),
      },
    },
    samples: Object.fromEntries(Object.entries(renamePlan).slice(0, 20)),
    collisions: {
      fr: frCollisions,
      en: enCollisions,
    },
  });

  console.log("✓ i18n renormalize done");
  console.log("  - keys map:", path.relative(ROOT, OUT_KEYS_MAP));
  console.log("  - plan:    ", path.relative(ROOT, OUT_PLAN));
  console.log("  - FR saved:", path.relative(ROOT, FR_PATH));
  console.log("  - EN saved:", path.relative(ROOT, EN_PATH));
}

main();
