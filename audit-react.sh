#!/usr/bin/env bash
set -e

mkdir -p reports

echo "== ESLint =="
npx eslint . --ext .js,.jsx > reports/eslint.txt || true

echo "== Knip =="
npx knip --production --reporter markdown > reports/knip.md || true

echo "== Depcheck =="
npx depcheck --json > reports/depcheck.json || true

echo "== Madge (cycles) =="
npx madge src --circular --extensions js,jsx > reports/madge-circular.txt || true

echo "== Build + bundle analyze =="
npm run build || true

# Only run source-map-explorer if we actually have JS files + sourcemaps
if ls dist/assets/*.js >/dev/null 2>&1; then
  if ls dist/assets/*.js.map >/dev/null 2>&1; then
    npx source-map-explorer 'dist/assets/*.js' --html reports/sme.html || true
  else
    echo "Pas de sourcemaps détectées dans dist/assets. Activez build.sourcemap dans Vite pour SME." \
      > reports/sme.html
  fi
else
  echo "Aucun bundle JS trouvé dans dist/assets. Build absent/échoué ?" > reports/sme.html
fi

echo "== Gitleaks =="
if command -v gitleaks >/dev/null 2>&1; then
  # --report-format json for newer gitleaks
  gitleaks detect --no-git -s . --report-format json --report-path reports/gitleaks.json || true
else
  echo "gitleaks non trouvé. Installez-le (macOS) : brew install gitleaks" \
    > reports/gitleaks.json
fi

echo "== Assets =="
find public src -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.webp" -o -name "*.svg" \) \
  -exec du -h {} + | sort -h > reports/assets-sizes.txt || true

echo "== Fini. Regarde le dossier reports =="