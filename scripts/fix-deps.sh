# FILENAME: scripts/fix-deps.sh
#!/usr/bin/env bash
set -euo pipefail

# Detect package manager
if command -v pnpm >/dev/null 2>&1 && [ -f pnpm-lock.yaml ]; then PM="pnpm"
elif command -v yarn >/dev/null 2>&1 && [ -f yarn.lock ]; then PM="yarn"
else PM="npm"; fi

run() { echo "+ $PM $*"; case "$PM" in pnpm) pnpm $* ;; yarn) yarn $* ;; npm) npm $* ;; esac; }

echo "== Remove unused deps (depcheck) =="
# Unused dependencies
run remove dotenv dotenv-cli jsoneditor-react react-google-maps react-resizable || true
# Unused devDependencies (nous utilisons npx pour ces outils)
run remove -D madge @types/jscodeshift @types/react-dom depcheck jscodeshift knip prettier || true

echo "== Add missing deps (depcheck) =="
# Map lib: le code utilise google-map-react dans MapSelectModal
run add google-map-react

# Redux classique (rootReducer.js)
run add redux

# PropTypes
run add prop-types

# CodeMirror stack (utilisé par CodeKeywordEditor)
run add @uiw/react-codemirror @codemirror/view @codemirror/state @codemirror/autocomplete @codemirror/lang-html

echo "== Install =="
case "$PM" in
  pnpm) pnpm install ;;
  yarn) yarn install ;;
  npm) npm install ;;
esac

echo "== Done =="