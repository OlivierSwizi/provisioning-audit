// FILENAME: scripts/i18n-keys-remap.codemod.js
// CommonJS compatible avec jscodeshift

const fs = require("fs");
const path = require("path");

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  const MAP_PATH = path.join(process.cwd(), "scripts", "i18n-keys-map.generated.json");
  if (!fs.existsSync(MAP_PATH)) return null;

  let keyMap;
  try {
    keyMap = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
  } catch (e) {
    console.warn(`[i18n-codemod] Invalid JSON: ${e.message}`);
    return null;
  }

  let didChange = false;

  function replaceArgIfMapped(p) {
    const args = p.node.arguments || [];
    if (!args.length) return;
    const a0 = args[0];
    if (!a0 || (a0.type !== "Literal" && a0.type !== "StringLiteral")) return;
    const oldKey = a0.value;
    const newKey = keyMap[oldKey];
    if (newKey && newKey !== oldKey) {
      a0.value = newKey;
      didChange = true;
    }
  }

  // t('xxx')
  root.find(j.CallExpression, { callee: { name: "t" } }).forEach(replaceArgIfMapped);

  // i18n.t('xxx')
  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        object: { name: "i18n" },
        property: { name: "t" },
      },
    })
    .forEach(replaceArgIfMapped);

  return didChange ? root.toSource() : null;
};
