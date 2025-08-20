/**
 * @param {import('jscodeshift').FileInfo} file
 * @param {import('jscodeshift').API} api
 */
function transformer(file, api, options) {
  try {
    const j = api.jscodeshift;
    const root = j(file.source);

    const nodes = root.find(j.JSXOpeningElement, {
      name: { type: "JSXIdentifier", name: "Button" },
    });

    nodes.forEach((path) => {
      path.value.attributes = path.value.attributes.filter((attr) => {
        return attr.name?.name !== "ghost";
      });

      const typeIdx = path.value.attributes.findIndex((attr) => attr.name?.name === "type");

      if (path.value.attributes[typeIdx]?.value?.value === "ghost") {
        path.value.attributes = path.value.attributes.filter((attr) => {
          return attr.name?.name !== "type";
        });
      }

      if (path.value.attributes[typeIdx]?.value?.value === "secondary") {
        path.value.attributes[typeIdx].value = j.literal("primary");
      }
    });

    return root.toSource();
  } catch (error) {
    console.error(error);
  }
}

module.exports = transformer;
