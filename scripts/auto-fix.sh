# FILENAME: scripts/auto-fix.sh
#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
mkdir -p reports

timestamp() { date +"%Y-%m-%d %H:%M:%S"; }
log() { echo -e "[$(timestamp)] $*"; }

# Detect package manager
if command -v pnpm >/dev/null 2>&1 && [ -f pnpm-lock.yaml ]; then PM="pnpm"
elif command -v yarn >/dev/null 2>&1 && [ -f yarn.lock ]; then PM="yarn"
else PM="npm"; fi
run_pm(){ case "$PM" in pnpm) pnpm "$@";; yarn) yarn "$@";; npm) npm "$@";; esac; }

log "== Using package manager: $PM =="
run_pm install >/dev/null 2>&1 || true

# 1) Fix deps (optionnel si tu as scripts/fix-deps.sh)
if [ -x "scripts/fix-deps.sh" ]; then
  log "== Fixing deps =="
  ./scripts/fix-deps.sh || true
fi

# 2) ESLint autofix (supprime les imports inutiles si plugin installé)
log "== ESLint --fix =="
if npx --yes eslint -v >/dev/null 2>&1; then
  npx --yes eslint . --ext .js,.jsx --fix || true
  npx --yes eslint . --ext .js,.jsx --report-unused-disable-directives > reports/eslint-after-autofix.txt || true
else
  log "ESLint not found."
fi

# 3) Prettier
log "== Prettier --write =="
if npx --yes prettier -v >/dev/null 2>&1; then
  npx --yes prettier . --write >/dev/null 2>&1 || true
  npx --yes prettier . --check --loglevel warn > reports/prettier-after-write.txt 2>&1 || true
else
  log "Prettier not found."
fi

# 4) Summary
ESLINT_SUMMARY=$(grep -Eo '✖ [0-9]+ problems \([0-9]+ errors, [0-9]+ warnings\)' reports/eslint-after-autofix.txt | tail -n1 || echo "No summary")
PRETTIER_SUMMARY=$(grep -qi "All matched files use Prettier code style!" reports/prettier-after-write.txt && echo "Prettier OK" || echo "Check prettier-after-write.txt")

cat > reports/auto-fix-summary.txt <<EOF
Auto-fix summary (${PM}) — $(timestamp)

ESLint: ${ESLINT_SUMMARY}
Prettier: ${PRETTIER_SUMMARY}

Notes:
- Exclusions (assets/**, build/**, dist/**, reports/**) gérées via eslint.config.js et .prettierignore.
- Les quelques erreurs restantes (duplicate props, const réassignées, deps manquantes de hooks) sont à corriger manuellement.
EOF

log "Done. See reports/auto-fix-summary.txt"