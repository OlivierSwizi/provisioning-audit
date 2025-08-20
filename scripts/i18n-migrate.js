// FILENAME: scripts/i18n-migrate.js
/* eslint-disable no-console */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const REPORTS = path.join(ROOT, "reports");
const OUT_FR = path.join(ROOT, "i18n", "lang", "fr", "translation.json");
const OUT_EN = path.join(ROOT, "i18n", "lang", "en", "translation.json");
const PREFIX_CFG = path.join(ROOT, "scripts", "i18n-prefixes.json");
const PLAN_JSON = path.join(REPORTS, "i18n-migrate-plan.json");
const KEYS_MAP_OUT = path.join(ROOT, "scripts", "i18n-keys-map.generated.json");

const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });
const readJSON = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null);

// ---- 1) Charger la config de préfixes ---------------------------------------
function loadPrefixConfig() {
  console.log("Load prefix config:", PREFIX_CFG);

  const cfg = readJSON(PREFIX_CFG);
  if (!cfg || !Array.isArray(cfg.patterns)) {
    throw new Error(`Missing/invalid ${PREFIX_CFG}`);
  }
  return cfg;
}

// Glob très simple (sans dépendance)
function matchGlob(file, glob) {
  const norm = file.replace(/\\/g, "/");
  const g = glob
    .replace(/\\/g, "/")
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "(.+?)")
    .replace(/\*/g, "([^/]+?)");
  const re = new RegExp(`^${g}$`);
  return re.test(norm);
}

function prefixForFile(file, cfg) {
  const norm = file.replace(/\\/g, "/");
  for (const { glob, prefix } of cfg.patterns) {
    if (matchGlob(norm, path.join(ROOT, glob))) return prefix;
  }
  return cfg.default || "common";
}

// ---- 2) Scanner le code : collecter toutes les clés -------------------------
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

function collectTKeys() {
  const re = /\b(?:i18n\.)?t\(\s*(['"`])([^'"`]+)\1/g;
  const map = new Map(); // key -> Set(files)
  const files = walk(SRC, []);
  for (const f of files) {
    const code = fs.readFileSync(f, "utf8");
    let m;
    while ((m = re.exec(code))) {
      const k = m[2].trim();
      if (!k) continue;
      if (!map.has(k)) map.set(k, new Set());
      map.get(k).add(f);
    }
  }
  return map;
}

// ---- 3) Charger locales existantes -----------------------------------------
function findLocaleFiles() {
  const candidates = [
    path.join(ROOT, "public", "locales", "fr", "translation.json"),
    path.join(ROOT, "public", "locales", "en", "translation.json"),
    path.join(ROOT, "i18n", "lang", "fr", "translation.json"),
    path.join(ROOT, "i18n", "lang", "en", "translation.json"),
  ];
  const fr = candidates.find((p) => /\/fr\/translation\.json$/.test(p) && fs.existsSync(p));
  const en = candidates.find((p) => /\/en\/translation\.json$/.test(p) && fs.existsSync(p));
  return { fr, en };
}

function flatten(obj, prefix = "", out = {}) {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) {
      const nk = prefix ? `${prefix}.${k}` : k;
      flatten(v, nk, out);
    }
  } else {
    out[prefix] = obj;
  }
  return out;
}

function unflatten(flat) {
  const root = {};
  for (const [k, v] of Object.entries(flat)) {
    const parts = k.split(".");
    let cur = root;
    for (let i = 0; i < parts.length; i += 1) {
      const p = parts[i];
      if (i === parts.length - 1) cur[p] = v;
      else cur[p] = cur[p] || {};
      cur = cur[p];
    }
  }
  return root;
}

// Petit lexique FR->EN pour les cas connus (complétable au besoin)
const FR_EN_LEXICON = new Map([
  ["Annuler", "Cancel"],
  ["Exporter", "Export"],
  ["Sauvegarder", "Save"],
  ["Nouveau", "New"],
  ["Chargement…", "Loading…"],
  ["Liens", "Links"],
  ["Sites", "Sites"],
  ["Exports", "Exports"],
  ["Raccourcis", "Shortcuts"],
  ["Dernier build", "Last build"],
  ["Numéro de build", "Build number"],
  ["Les 6 derniers mois", "Last 6 months"],
  ["Les 12 derniers mois", "Last 12 months"],
  ["Ce mois", "This month"],
  ["Cette année", "This year"],
  ["Libellé", "Label"],
  ["Référence", "Reference"],
  ["Actualiser la preview", "Refresh preview"],
  ["Insérer une image", "Insert image"],
  ["Aucun mot-clé", "No keywords"],
  ["Accès", "Access"],
  ["Environnement", "Environment"],
  ["Tenant", "Tenant"],
  ["Endpoint", "Endpoint"],
  ["Version", "Version"],
]);

const copyOrTranslateToEn = (fr) => {
  if (typeof fr !== "string") return fr;
  if (FR_EN_LEXICON.has(fr)) return FR_EN_LEXICON.get(fr);
  // défaut: copie FR → EN (on évite de laisser vide)
  return fr;
};

// ---- 4) Construire un plan de renommage ------------------------------------
function buildRenamePlan(keyToFiles, cfg) {
  const plan = {}; // oldKey -> newKey
  for (const [key, files] of keyToFiles.entries()) {
    if (!key || key.startsWith("_")) continue;

    // déjà préfixée ? (a.b)
    const alreadyPrefixed = key.includes(".");
    if (alreadyPrefixed) continue;

    // choisir le prefix via le 1er fichier où on la voit
    const anyFile = Array.from(files)[0];
    const prefix = prefixForFile(anyFile, cfg);
    plan[key] = `${prefix}.${key}`;
  }
  return plan;
}

// ---- 5) Appliquer le plan aux locales et produire les nouvelles ------------

function migrateLocales(renamePlan, frFlatOld, enFlatOld) {
  // 1) nouvelles maps plates
  const frNew = {};
  const enNew = {};

  // a) transférer toutes les vieilles clés (préfixées déjà) telles quelles
  for (const [k, v] of Object.entries(frFlatOld)) {
    const newKey = renamePlan[k] || k;
    frNew[newKey] = v;
  }
  for (const [k, v] of Object.entries(enFlatOld)) {
    const newKey = renamePlan[k] || k;
    enNew[newKey] = v;
  }

  // b) s’assurer que toutes les oldKeys vues dans le code existent au moins en FR
  // (si pas de valeur FR trouvée, on met la clé elle-même pour ne rien casser)
  for (const [oldKey, newKey] of Object.entries(renamePlan)) {
    if (!(newKey in frNew)) {
      frNew[newKey] = frFlatOld[oldKey] ?? oldKey;
    }
    if (!(newKey in enNew)) {
      const src = frNew[newKey];
      enNew[newKey] = copyOrTranslateToEn(src);
    }
  }

  return { frNew, enNew };
}

// ---- 6) Main ----------------------------------------------------------------
function main() {
  ensureDir(REPORTS);
  const cfg = loadPrefixConfig();

  // collect code keys
  const keyToFiles = collectTKeys();

  // build rename plan for unprefixed keys
  const renamePlan = buildRenamePlan(keyToFiles, cfg);

  // read existing locales
  const lf = findLocaleFiles();
  const frOldObj = lf.fr ? readJSON(lf.fr) : {};
  const enOldObj = lf.en ? readJSON(lf.en) : {};

  const frFlatOld = flatten(frOldObj);
  const enFlatOld = flatten(enOldObj);

  const { frNew, enNew } = migrateLocales(renamePlan, frFlatOld, enFlatOld);

  // write outputs
  const frOutDir = path.dirname(OUT_FR);
  const enOutDir = path.dirname(OUT_EN);
  ensureDir(frOutDir);
  ensureDir(enOutDir);

  fs.writeFileSync(OUT_FR, JSON.stringify(unflatten(frNew), null, 2), "utf8");
  fs.writeFileSync(OUT_EN, JSON.stringify(unflatten(enNew), null, 2), "utf8");

  // plan + keys map
  fs.writeFileSync(
    PLAN_JSON,
    JSON.stringify(
      {
        summary: {
          codeKeys: keyToFiles.size,
          renamed: Object.keys(renamePlan).length,
          outFr: path.relative(ROOT, OUT_FR),
          outEn: path.relative(ROOT, OUT_EN),
        },
        renamePlan,
      },
      null,
      2,
    ),
    "utf8",
  );

  fs.writeFileSync(KEYS_MAP_OUT, JSON.stringify(renamePlan, null, 2), "utf8");

  console.log("i18n migration plan written:", path.relative(ROOT, PLAN_JSON));
  console.log("keys map written:", path.relative(ROOT, KEYS_MAP_OUT));
  console.log("locales written:", path.relative(ROOT, OUT_FR), "and", path.relative(ROOT, OUT_EN));
}

main();
