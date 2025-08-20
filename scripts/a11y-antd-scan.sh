# FILENAME: scripts/a11y-antd-scan.sh
#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
mkdir -p reports

OUT="reports/a11y-antd-scan.txt"
echo "== AntD A11y quick scan ==" > "$OUT"
date >> "$OUT"
echo >> "$OUT"

echo "[Button icon sans aria-label]" >> "$OUT"
# Heuristique: <Button ... icon= ...> sans aria-label sur la même ligne
grep -RIn --include='*.{js,jsx}' -E '<Button[^>]*icon=' src | grep -v 'aria-label=' >> "$OUT" || true
echo >> "$OUT"

echo "[Image sans alt]" >> "$OUT"
grep -RIn --include='*.{js,jsx}' -E '<Image[^>]*src=' src | grep -v 'alt=' >> "$OUT" || true
echo >> "$OUT"

echo "[Avatar avec src sans alt]" >> "$OUT"
grep -RIn --include='*.{js,jsx}' -E '<Avatar[^>]*src=' src | grep -v 'alt=' >> "$OUT" || true
echo >> "$OUT"

echo "[Input hors Form.Item probable: champs sans aria-label (heuristique)]" >> "$OUT"
# Heuristique simple: <Input ...> ou <Input.Search ...> sans aria-label
grep -RIn --include='*.{js,jsx}' -E '<Input(\.Search)?[^>]*>' src \
  | grep -v 'aria-label=' \
  | grep -v 'aria-labelledby=' >> "$OUT" || true
echo >> "$OUT"

echo "[Icônes cliquables hors Button (span/div onClick) — à vérifier]" >> "$OUT"
grep -RIn --include='*.{js,jsx}' -E '<(span|div)[^>]*onClick=' src >> "$OUT" || true
echo >> "$OUT"

echo "=> Rapport: $OUT"