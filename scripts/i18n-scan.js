// FILENAME: scripts/i18n-scan.js
/* eslint-disable no-console */
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const REPORTS_DIR = path.join(ROOT, "reports");
const OUT_TXT = path.join(REPORTS_DIR, "i18n-scan.txt");
// Change à true si tu veux aussi un JSON machine-readable
const EMIT_JSON = false;
const OUT_JSON = path.join(REPORTS_DIR, "i18n-scan.json");

// Extensions scannées
const EXTS = new Set([".js", ".jsx"]);

/**
 * Walk simple (sans dépendance) pour lister les fichiers
 */
function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    const ents = fs.readdirSync(d, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        // ignore dossiers non pertinents
        if (["node_modules", "assets", "build", "dist", "reports"].includes(e.name)) continue;
        stack.push(p);
      } else if (EXTS.has(path.extname(p))) {
        out.push(p);
      }
    }
  }
  return out;
}

/**
 * Ligne/colonne d'un index dans une string
 */
function lineColOf(text, index) {
  let line = 1;
  let col = 1;
  for (let i = 0; i < index; i += 1) {
    if (text[i] === "\n") {
      line += 1;
      col = 1;
    } else {
      col += 1;
    }
  }
  return { line, col };
}

/**
 * Utilitaires de détection
 */
const hasLetters = (s) => /[A-Za-zÀ-ÿ]{3,}/.test(s);

// 1) Texte JSX “en dur”: on capture > ... < sans { } à l’intérieur
function findJsxTextLiterals(code) {
  const results = [];
  // capture brute entre > ... < (non-gourmand), on filtrera ensuite
  const re = />\s*([^<>{}][^<>{}]*)\s*</g;
  let m;
  while ((m = re.exec(code))) {
    const raw = (m[1] || "").trim();
    if (!raw) continue;
    if (!hasLetters(raw)) continue;
    // Exclure trucs du style &nbsp; etc. qui n'ont pas vraiment de texte
    if (/^&[a-zA-Z]+;?$/.test(raw)) continue;
    const { line, col } = lineColOf(code, m.index);
    results.push({ line, col, text: raw });
  }
  return results;
}

// 2) Attributs textuels en dur: placeholder/title/aria-label/aria-labelledby
function findAttrTextLiterals(code) {
  const results = [];
  // on ne veut que des chaînes littérales " ... "
  const re = /\b(placeholder|title|aria-label|aria-labelledby)\s*=\s*"([^"]*?)"/g;
  let m;
  while ((m = re.exec(code))) {
    const [, attr, val] = m;
    const raw = (val || "").trim();
    if (!raw) continue;
    if (!hasLetters(raw)) continue;
    const { line, col } = lineColOf(code, m.index);
    results.push({ line, col, attr, text: raw });
  }
  return results;
}

// 3) AntD <Button>texte</Button> direct (pas d'expression enfant)
function findAntdButtonText(code) {
  const results = [];
  // simpliste: matche <Button ...> TEXT </Button> où TEXT n'a ni { ni < à l'intérieur
  const re = /<Button\b[^>]*>([^<{][^<{]*?)<\/Button>/g;
  let m;
  while ((m = re.exec(code))) {
    const inner = (m[1] || "").trim();
    if (!inner) continue;
    if (!hasLetters(inner)) continue;
    // si on voit t( dans le texte (peu probable), on ignore
    if (/t\s*\(/.test(inner)) continue;
    const { line, col } = lineColOf(code, m.index);
    results.push({ line, col, text: inner });
  }
  return results;
}

/**
 * Post-filtre: si la même ligne contient déjà t( ... ), on ignore
 * (utile pour les faux positifs de la règle 1).
 */
function filterOutLinesWithTCalls(code, items) {
  const lines = code.split("\n");
  return items.filter(({ line }) => !/t\s*\(/.test(lines[line - 1] || ""));
}

/**
 * Génération du rapport
 */
function formatFinding(file, f) {
  return `${file}:${f.line}:${f.col}  ${
    f.text ? JSON.stringify(f.text) : f.attr ? `${f.attr}=` : ""
  }`;
}

function run() {
  if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const files = walk(SRC_DIR);

  const report = {
    summary: { files: files.length, jsxText: 0, attrs: 0, buttons: 0 },
    jsxText: [],
    attrs: [],
    buttons: [],
  };

  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");

    const jsxText = filterOutLinesWithTCalls(code, findJsxTextLiterals(code)).map((f) => ({
      file: path.relative(ROOT, file),
      ...f,
    }));

    const attrs = findAttrTextLiterals(code).map((f) => ({
      file: path.relative(ROOT, file),
      ...f,
    }));

    const buttons = filterOutLinesWithTCalls(code, findAntdButtonText(code)).map((f) => ({
      file: path.relative(ROOT, file),
      ...f,
    }));

    report.jsxText.push(...jsxText);
    report.attrs.push(...attrs);
    report.buttons.push(...buttons);
  }

  report.summary.jsxText = report.jsxText.length;
  report.summary.attrs = report.attrs.length;
  report.summary.buttons = report.buttons.length;

  // TXT
  const lines = [];
  lines.push("== i18n hardcoded strings scan ==");
  lines.push(new Date().toISOString());
  lines.push("");

  lines.push("[JSX text nodes suspects]");
  if (report.jsxText.length === 0) lines.push("(none)");
  else report.jsxText.forEach((r) => lines.push(formatFinding(r.file, r)));

  lines.push("");
  lines.push("[Attributes texte (placeholder/title/aria-*)]");
  if (report.attrs.length === 0) lines.push("(none)");
  else report.attrs.forEach((r) => lines.push(formatFinding(r.file, r)));

  lines.push("");
  lines.push("[AntD <Button>texte</Button> sans t(...)]");
  if (report.buttons.length === 0) lines.push("(none)");
  else report.buttons.forEach((r) => lines.push(formatFinding(r.file, r)));

  fs.writeFileSync(OUT_TXT, lines.join("\n"), "utf8");
  console.log(`i18n scan done → ${path.relative(ROOT, OUT_TXT)}`);
  console.log(report.summary);

  // JSON (optionnel)
  if (EMIT_JSON) {
    fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), "utf8");
    console.log(`JSON → ${path.relative(ROOT, OUT_JSON)}`);
  }
}

run();
