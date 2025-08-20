// FILENAME: scripts/deadcode-find.js
/* eslint-disable no-console */
import fs from "fs";
import path from "path";
import madge from "madge";

const ROOT = process.cwd();

// 🔎 Ajuste selon tes vrais entry points existants
const ENTRY_POINTS = [
  "src/index.jsx",
  "src/main.jsx",
  "src/App.jsx",
  "src/layout/router.jsx",
  "src/layout/AppLayout.jsx",
]
  .map((p) => path.join(ROOT, p))
  .filter((p) => fs.existsSync(p));

/**
 * Globs à exclure (style bash/micromatch)
 * Exemple: node_modules/** ou assets/**
 */
const IGNORE_GLOBS = [
  "node_modules/**",
  "assets/**",
  "**/assets/**",
  "**/*.css",
  "**/*.scss",
  "**/*.less",
  "**/*.svg",
  "**/*.png",
  "**/*.jpg",
  "**/*.jpeg",
  "**/*.gif",
  "**/*.md",
  "**/*.json",
  "**/__mocks__/**",
  "**/__tests__/**",
];

/** Convertit un glob simple en RegExp sûre pour madge */
function globToRegex(glob) {
  const g = glob.replace(/\\/g, "/"); // normalise
  const escapeRe = (s) => s.replace(/[|\\{}()[\]^$+?.]/g, "\\$&"); // n’échappe PAS * ni /
  let re = "^";
  for (let i = 0; i < g.length; i += 1) {
    const c = g[i];
    if (c === "*") {
      // double astérisque => match multi-segments
      if (g[i + 1] === "*") {
        re += ".*";
        i += 1;
      } else {
        // simple astérisque => match intra-segment
        re += "[^/]*";
      }
    } else if (c === "?") {
      re += ".";
    } else if (c === "/") {
      re += "\\/";
    } else {
      re += escapeRe(c);
    }
  }
  re += "$";
  return new RegExp(re);
}

async function run() {
  if (ENTRY_POINTS.length === 0) {
    console.error("❌ Aucun entrypoint trouvé. Modifie ENTRY_POINTS dans scripts/deadcode-find.js");
    process.exit(1);
  }

  const excludeRegExp = IGNORE_GLOBS.map(globToRegex);

  const res = await madge(ENTRY_POINTS, {
    baseDir: ROOT,
    fileExtensions: ["js", "jsx"],
    excludeRegExp,
    includeNpm: false,
    detectiveOptions: {
      es6: { mixedImports: true },
      css: false,
      ts: false,
    },
  });

  const orphans = res.orphans().filter((p) => p.startsWith("src/"));
  const circular = res.circular();

  const REPORTS_DIR = path.join(ROOT, "reports");
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const out = {
    entryPoints: ENTRY_POINTS.map((p) => path.relative(ROOT, p)),
    ignoreGlobs: IGNORE_GLOBS,
    orphans,
    circular,
    generatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(REPORTS_DIR, "deadcode-report.json"), JSON.stringify(out, null, 2));

  console.log(`🧹 Rapport généré: reports/deadcode-report.json
- Entrypoints: ${out.entryPoints.length}
- Orphelins: ${orphans.length}
- Cycles: ${circular.length}`);

  if (orphans.length) {
    console.log("\nExemples d’orphelins:");
    console.log(
      orphans
        .slice(0, 10)
        .map((f) => `  • ${f}`)
        .join("\n"),
    );
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
