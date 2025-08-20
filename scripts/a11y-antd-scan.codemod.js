// FILENAME: scripts/a11y-antd-scan.codemod.js
/**
 * Scan AST (lecture seule) avec jscodeshift pour trouver:
 *  - <Button icon={...}/> sans aria-label et sans texte lisible
 *  - <Image .../> sans alt
 *  - <Avatar src=.../> sans alt
 *  - <Input / <Input.Search .../> sans aria-label/aria-labelledby ET hors Form.Item (détection par ancêtres)
 *
 * Usage:
 *   npx jscodeshift -t scripts/a11y-antd-scan.codemod.js "src/**\/*.{js,jsx}" --parser=tsx
 * (Le codemod n'écrit rien: il affiche des warnings dans la console)
 */
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const results = [];

  const getName = (el) => {
    if (!el || el.type !== "JSXElement") return null;
    const n = el.openingElement.name;
    if (!n) return null;
    if (n.type === "JSXIdentifier") return n.name; // Button
    if (n.type === "JSXMemberExpression") {
      // Input.Search
      const left = n.object && n.object.name;
      const right = n.property && n.property.name;
      return left && right ? `${left}.${right}` : null;
    }
    return null;
  };

  const hasAttr = (el, attrName) =>
    el.openingElement.attributes?.some(
      (a) => a.type === "JSXAttribute" && a.name?.name === attrName,
    );

  const getAttr = (el, attrName) =>
    el.openingElement.attributes?.find(
      (a) => a.type === "JSXAttribute" && a.name?.name === attrName,
    );

  const hasNonEmptyTextChildren = (el) =>
    el.children?.some((c) => {
      if (c.type === "JSXText") return c.value.trim().length > 0;
      // IconButton avec texte masqué via VisuallyHidden n'est pas détecté ici
      if (c.type === "JSXExpressionContainer" && c.expression.type === "StringLiteral") {
        return c.expression.value.trim().length > 0;
      }
      return false;
    });

  // Helper: détecter si un élément a un ancêtre <Form.Item ...>
  const isInsideFormItem = (path) => {
    let p = path.parent;
    while (p) {
      const n = p.value;
      if (n && n.type === "JSXElement" && getName(n) === "Form.Item") return true;
      p = p.parent;
    }
    return false;
  };

  root.find(j.JSXElement).forEach((path) => {
    const el = path.value;
    const name = getName(el);
    if (!name) return;

    // 1) Button icon-only sans aria-label
    if (name === "Button" && getAttr(el, "icon") && !hasAttr(el, "aria-label")) {
      const text = hasNonEmptyTextChildren(el);
      if (!text) {
        results.push({
          type: "ButtonIconNoAria",
          loc: el.openingElement.loc?.start || file.path,
        });
      }
    }

    // 2) Image sans alt
    if (name === "Image" && !hasAttr(el, "alt")) {
      results.push({ type: "ImageNoAlt", loc: el.openingElement.loc?.start || file.path });
    }

    // 3) Avatar avec src sans alt
    if (name === "Avatar" && getAttr(el, "src") && !hasAttr(el, "alt")) {
      results.push({ type: "AvatarNoAlt", loc: el.openingElement.loc?.start || file.path });
    }

    // 4) Input / Input.Search sans aria-label/labelledby ET hors Form.Item
    if ((name === "Input" || name === "Input.Search") && !isInsideFormItem(path)) {
      const hasAria = hasAttr(el, "aria-label") || hasAttr(el, "aria-labelledby");
      if (!hasAria) {
        results.push({
          type: "InputNoAriaOutsideFormItem",
          loc: el.openingElement.loc?.start || file.path,
        });
      }
    }
  });

  if (results.length) {
    // Affichage simple (une ligne par warning)
    results.forEach((r) => {
      const where =
        typeof r.loc === "object" && r.loc.line != null
          ? `${file.path}:${r.loc.line}:${r.loc.column || 0}`
          : `${file.path}`;
      console.warn(`[A11Y] ${r.type} at ${where}`);
    });
  }

  // pas de modification
  return null;
}
