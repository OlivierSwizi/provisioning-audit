# FILENAME: scripts/auto-fix.sh
#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
mkdir -p reports

timestamp() { date +"%Y-%m-%d %H:%M:%S"; }
log() { echo -e "[$(timestamp)] $*"; }

# Detect package manager (pnpm > yarn > npm)
if command -v pnpm >/dev/null 2>&1 && [ -f pnpm-lock.yaml ]; then
  PM="pnpm"
elif command -v yarn >/dev/null 2>&1 && [ -f yarn.lock ]; then
  PM="yarn"
else
  PM="npm"
fi

run_pm() {
  case "$PM" in
    pnpm) pnpm "$@";;
    yarn) yarn "$@";;
    npm)  npm  "$@";;
  esac
}

log "== Package manager: ${PM}"
run_pm install >/dev/null 2>&1 || true

# Step 1 — Fix dependencies (optional)
if [ -x "scripts/fix-deps.sh" ]; then
  log "== Running scripts/fix-deps.sh =="
  ./scripts/fix-deps.sh || true
else
  log "== Skip deps fix (scripts/fix-deps.sh not found)."
fi

# Step 2 — ESLint autofix (exclude assets/**)
log "== ESLint --fix (excluding assets/**) =="
if npx --yes eslint -v >/dev/null 2>&1; then
  npx --yes eslint . \
    --ext .js,.jsx \
    --ignore-pattern 'assets/**' \
    --fix || true
  npx --yes eslint . \
    --ext .js,.jsx \
    --ignore-pattern 'assets/**' \
    --report-unused-disable-directives \
    > reports/eslint-after-autofix.txt || true
else
  log "ESLint not available via npx (skipped)."
fi

# Step 3 — Prettier (formatage) — .prettierignore exclut assets/**
log "== Prettier --write (assets/** ignored by .prettierignore) =="
if npx --yes prettier -v >/dev/null 2>&1; then
  npx --yes prettier . --write >/dev/null 2>&1 || true
  npx --yes prettier . --check --loglevel warn > reports/prettier-after-write.txt 2>&1 || true
else
  log "Prettier not available via npx (skipped)."
fi

# Step 4 — Quick summary
ESLINT_SUMMARY="No ESLint run"
if [ -f reports/eslint-after-autofix.txt ]; then
  ERRORS=$(grep -Eo '✖ [0-9]+ problems \([0-9]+ errors, [0-9]+ warnings\)' reports/eslint-after-autofix.txt | tail -n1 || true)
  ESLINT_SUMMARY="${ERRORS:-'No remaining ESLint summary found (maybe 0 issues)'}"
fi

PRETTIER_SUMMARY="No Prettier run"
if [ -f reports/prettier-after-write.txt ]; then
  if grep -qi "All matched files use Prettier code style!" reports/prettier-after-write.txt; then
    PRETTIER_SUMMARY="Prettier OK"
  else
    PRETTIER_SUMMARY="See reports/prettier-after-write.txt"
  fi
fi

cat > reports/auto-fix-summary.txt <<EOF
Auto-fix summary (${PM}) — $(timestamp)

ESLint: ${ESLINT_SUMMARY}
Prettier: ${PRETTIER_SUMMARY}

Notes:
- Les fichiers sous assets/** sont exclus de tout audit/formatage.
- Les erreurs restantes sont généralement:
  • props dupliquées (react/jsx-no-duplicate-props)
  • const réassignée (no-const-assign)
  • apostrophes non échappées (react/no-unescaped-entities)
  • deps manquantes dans les hooks (react-hooks/exhaustive-deps)
EOF

log "Done. See reports/auto-fix-summary.txt"