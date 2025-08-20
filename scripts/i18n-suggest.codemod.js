// FILENAME: scripts/i18n-suggest.codemod.js
/**
 * Usage:
 *   npx jscodeshift -t scripts/i18n-suggest.codemod.js src/views/Users/UsersView.jsx --parser=tsx --prefix=usr
 *
 * Effet:
 *   - Loggue les endroits où il voit un texte "dur" dans JSX/props (placeholder/title)
 *   - Suggère une clé `usr.xxx`
 *   - N'écrit rien (lecture seule)
 */

export default function transformer(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const prefix = options.prefix || "common";

  const suggestions = [];

  const push = (msg, loc) => {
    const where =
      loc && loc.start ? `${file.path}:${loc.start.line}:${loc.start.column || 0}` : file.path;
    // eslint-disable-next-line no-console
    console.warn(`[i18n] ${where}  ${msg}`);
  };

  // Texte brut dans JSX
  root.find(j.JSXText).forEach((p) => {
    const val = (p.node.value || "").trim();
    if (!val) return;
    if (val.length < 3) return;
    if (/\{|\}/.test(val)) return;
    // ignore déjà internationalisé : heuristique, on ne peut pas le savoir ici
    suggestions.push({ type: "JSXText", text: val, loc: p.node.loc });
  });

  // Attributs texte: placeholder/title
  root.find(j.JSXAttribute).forEach((p) => {
    const name = p.node.name?.name;
    if (!["placeholder", "title", "aria-label"].includes(name)) return;
    const val = p.node.value;
    if (!val) return;
    if (val.type === "Literal" || val.type === "StringLiteral") {
      const s = (val.value || "").trim();
      if (s && s.length >= 3) {
        suggestions.push({ type: `attr:${name}`, text: s, loc: p.node.loc });
      }
    }
  });

  // Affichage
  suggestions.forEach((s, idx) => {
    const key = `${prefix}.key${idx + 1}`;
    push(`${s.type} → "${s.text}"  =>  t('${key}')`, s.loc);
  });

  return null;
}
