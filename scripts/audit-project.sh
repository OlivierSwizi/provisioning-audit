# FILENAME: scripts/audit-project.sh
#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORTS_DIR="${ROOT_DIR}/reports"
mkdir -p "$REPORTS_DIR"

timestamp() { date +"%Y-%m-%d %H:%M:%S"; }
log() { echo -e "[$(timestamp)] $*"; }

# Detect package manager
if command -v pnpm >/dev/null 2>&1 && [ -f "${ROOT_DIR}/pnpm-lock.yaml" ]; then
  PM="pnpm"
elif command -v yarn >/dev/null 2>&1 && [ -f "${ROOT_DIR}/yarn.lock" ]; then
  PM="yarn"
else
  PM="npm"
fi

run_script_if_present() {
  local script="$1"
  if jq -e --arg s "$script" '.scripts[$s] // empty' < "${ROOT_DIR}/package.json" >/dev/null 2>&1; then
    case "$PM" in
      pnpm) pnpm run "$script" ;;
      yarn) yarn "$script" ;;
      *) npm run "$script" ;;
    esac
    return 0
  fi
  return 1
}

cd "$ROOT_DIR"

log "== Project info =="
{
  echo "Date: $(timestamp)"
  echo "Node: $(node -v 2>/dev/null || echo 'node not found')"
  echo "Package Manager: ${PM}"
  echo "Git branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'n/a')"
  echo "Git status:"
  git status -sb 2>/dev/null || true
} > "${REPORTS_DIR}/project-info.txt" || true

# 1) ESLint
log "== ESLint =="
if npx --yes eslint -v >/dev/null 2>&1; then
  npx --yes eslint . --ext .js,.jsx,.ts,.tsx > "${REPORTS_DIR}/eslint.txt" || true
else
  echo "ESLint not available (skipped)." > "${REPORTS_DIR}/eslint.txt"
fi

# 2) Prettier
log "== Prettier (check) =="
if npx --yes prettier -v >/dev/null 2>&1; then
  npx --yes prettier . --check --loglevel warn > "${REPORTS_DIR}/prettier.txt" 2>&1 || true
else
  echo "Prettier not available (skipped)." > "${REPORTS_DIR}/prettier.txt"
fi

# 3) Knip
log "== Knip (dead code) =="
if npx --yes knip --version >/dev/null 2>&1; then
  npx --yes knip --production --reporter markdown > "${REPORTS_DIR}/knip.md" 2>&1 || true
else
  echo "Knip not available (skipped)." > "${REPORTS_DIR}/knip.md"
fi

# 4) Depcheck
log "== depcheck =="
if npx --yes depcheck --version >/dev/null 2>&1; then
  npx --yes depcheck --skip-missing=true --ignore-dirs=assets > "${REPORTS_DIR}/depcheck.txt" 2>&1 || true
else
  echo "depcheck not available (skipped)." > "${REPORTS_DIR}/depcheck.txt"
fi

# 5) Madge
log "== Madge (circular deps) =="
if npx --yes madge --version >/dev/null 2>&1; then
  npx --yes madge src --extensions js,jsx,ts,tsx --exclude '(^|/)assets(/|$)' --warning > "${REPORTS_DIR}/madge.txt" 2>&1 || true
else
  echo "madge not available (skipped)." > "${REPORTS_DIR}/madge.txt"
fi

# 6) Build
log "== Build (if present) =="
if ! run_script_if_present "build"; then
  echo "No build script found." > "${REPORTS_DIR}/build.txt"
else
  echo "Build ok" > "${REPORTS_DIR}/build.txt"
fi

# 7) Tests
log "== Tests (if present) =="
if ! run_script_if_present "test:ci"; then
  if ! run_script_if_present "test"; then
    echo "No test script found." > "${REPORTS_DIR}/tests.txt"
  else
    echo "Tests executed (see console)." > "${REPORTS_DIR}/tests.txt"
  fi
fi

# 8) Gitleaks
log "== Gitleaks (optional) =="
if command -v gitleaks >/dev/null 2>&1; then
  if [ -f ".gitleaks.toml" ]; then
    gitleaks detect --no-banner --config .gitleaks.toml --report-path "${REPORTS_DIR}/gitleaks-report.json" --report-format json || true
  else
    gitleaks detect --no-banner --report-path "${REPORTS_DIR}/gitleaks-report.json" --report-format json || true
  fi
else
  echo "gitleaks not installed." > "${REPORTS_DIR}/gitleaks.txt"
fi

log "== Summary =="
ls -1 "${REPORTS_DIR}" > "${REPORTS_DIR}/SUMMARY.txt"