// @/components/template-editors/components/KeywordBlot.js
import Quill from "quill";

const Embed = Quill.import("blots/embed");

class KeywordBlot extends Embed {
  static create(value) {
    const node = super.create();
    node.setAttribute("data-key", value);
    node.classList.add("keyword-token");
    node.textContent = `{{${value}}}`; // render literal token inside
    return node;
  }
  static value(node) {
    return node.getAttribute("data-key");
  }
}

KeywordBlot.blotName = "keyword";
KeywordBlot.tagName = "span";

// Register once (guard for HMR/StrictMode)
if (!Quill.imports["formats/keyword"]) {
  Quill.register(KeywordBlot, true);
}

export default KeywordBlot;
