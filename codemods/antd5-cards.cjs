/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
function transformer(file, api, options) {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);

    const nodes = root.find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Card" },
    });

    nodes.forEach((path) => {
      const attributes = path.value.attributes;
      const bordered = attributes.findIndex((attr) => attr.name?.name === "bordered");
      if (bordered === -1) {
        attributes.push(
          j.jsxAttribute(j.jsxIdentifier("bordered"), j.jsxExpressionContainer(j.literal(false))),
        );
      } else {
        const isBordered = attributes[bordered].value.expression.value;
        attributes[bordered].value.expression = j.literal(!isBordered);
      }
    });

    return root.toSource();
  } catch (error) {
    console.error(`Error in file: ${file.path})`, error);
  }
}

module.exports = transformer;
