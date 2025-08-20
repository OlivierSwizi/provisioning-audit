// @/components/template-editors/components/QuillKeywordEditor.jsx
import { useEffect, useRef } from "react";
import { useQuill } from "react-quilljs";
import Quill from "quill";
import "@/components/template-editors/components/KeywordBlot"; // side-effect: registers embed
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "@/components/template-editors/styles/quill.css";

// Barres d’outils par défaut (utilisées uniquement si showToolbar=true)
const DEFAULT_TOOLBAR_TITLE = [["bold", "italic", "underline"], ["link"], [{ list: "bullet" }]];
const DEFAULT_TOOLBAR_BODY = [
  ["bold", "italic", "underline", "strike"],
  [{ header: [false, 2, 3, 4] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "blockquote"],
  ["clean"],
];

// Regex pour détecter {{keyword}}
const TOKEN_RE = /{{\s*([^{}\s][^{}]*?)\s*}}/g;

const QuillKeywordEditor = ({
  value,
  onChange,
  placeholder,
  onOpenKeywordMenu,
  size = "small",
  toolbar = DEFAULT_TOOLBAR_TITLE,
  showToolbar = true, // ← paramétrable
  editorType = "body", // ← "title" | "body" (impacte la hauteur min via CSS)
}) => {
  const { quill, quillRef } = useQuill({
    modules: { toolbar: showToolbar ? toolbar : false },
    placeholder,
    theme: "snow",
    formats: [
      "keyword", // notre embed
      "bold",
      "italic",
      "underline",
      "strike",
      "header",
      "list",
      "link",
      "blockquote",
    ],
  });

  const handlersBoundRef = useRef(false);

  // Convertit toutes les occurrences {{...}} en embeds 'keyword'
  const convertAllTokensToEmbeds = () => {
    if (!quill) return;
    const fullText = quill.getText(0, quill.getLength());
    const matches = [];
    let m;
    while ((m = TOKEN_RE.exec(fullText)) !== null) {
      matches.push({ index: m.index, length: m[0].length, key: m[1].trim() });
    }
    if (!matches.length) return;
    quill.update("silent");
    for (let i = matches.length - 1; i >= 0; i--) {
      const { index, length, key } = matches[i];
      quill.deleteText(index, length, "silent");
      quill.insertEmbed(index, "keyword", key, "silent");
    }
    quill.update("silent");
  };

  // Look & feel compact (+ classes pour hauteur min via CSS)
  useEffect(() => {
    if (!quillRef?.current) return;
    const el = quillRef.current;
    const container = el.querySelector(".ql-container");
    if (container) {
      container.classList.add("ql-container-compact");
      container.classList.add(editorType === "title" ? "title-editor" : "body-editor");
    }
    if (size === "small" && showToolbar) {
      el.querySelector(".ql-toolbar")?.classList.add("ql-toolbar-compact");
    }
  }, [quillRef, size, showToolbar, editorType]);

  // Valeur contrôlée + conversion initiale des tokens
  useEffect(() => {
    if (!quill) return;
    const current = quill.root.innerHTML;
    if ((value || "") !== current) {
      const sel = quill.getSelection();
      quill.clipboard.dangerouslyPasteHTML(value || "", "silent");
      convertAllTokensToEmbeds();
      if (sel) quill.setSelection(sel, "silent");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, quill]);

  // Bind handlers (une fois) : détection "{{", clic token, matcher clipboard
  useEffect(() => {
    if (!quill || handlersBoundRef.current) return;

    const onTextChange = (_delta, _old, source) => {
      if (source !== "user") return;
      const range = quill.getSelection();
      if (!range) return;
      const index = range.index;
      const two = quill.getText(Math.max(0, index - 2), 2);
      if (two === "{{") {
        const bounds = quill.getBounds(index);
        onOpenKeywordMenu?.({
          quill,
          range,
          position: { top: bounds.top + bounds.height, left: bounds.left },
          replaceTrigger: true,
        });
      }
    };

    const onClick = (e) => {
      const base = e.target && e.target.nodeType === 3 ? e.target.parentElement : e.target;
      const tokenEl = base?.closest?.(".keyword-token");
      if (!tokenEl) return;
      const blot = Quill.find(tokenEl);
      if (!blot) return;
      const blotIndex = quill.getIndex(blot);
      const len = 1; // EMBED a longueur 1
      quill.setSelection(blotIndex, len, "user");
      const bounds = quill.getBounds(blotIndex, len);
      onOpenKeywordMenu?.({
        quill,
        range: { index: blotIndex, length: len },
        position: { top: bounds.top + bounds.height, left: bounds.left },
        replaceTrigger: false,
      });
    };

    quill.on("text-change", onTextChange);
    quill.root.addEventListener("click", onClick);

    const Delta = Quill.import("delta");
    quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
      const text = node.data;
      if (!text || !TOKEN_RE.test(text)) return delta;
      TOKEN_RE.lastIndex = 0;
      const parts = text.split(TOKEN_RE);
      const newDelta = new Delta();
      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          const chunk = parts[i];
          if (chunk) newDelta.insert(chunk);
        } else {
          const key = (parts[i] || "").trim();
          if (key) newDelta.insert({ keyword: key });
        }
      }
      return newDelta;
    });

    handlersBoundRef.current = true;
    return () => {
      quill.off("text-change", onTextChange);
      quill.root.removeEventListener("click", onClick);
      handlersBoundRef.current = false;
    };
  }, [quill, onOpenKeywordMenu]);

  // Propagation onChange
  useEffect(() => {
    if (!quill) return;
    const handler = () => onChange?.(quill.root.innerHTML);
    quill.on("text-change", handler);
    return () => quill.off("text-change", handler);
  }, [quill, onChange]);

  return <div ref={quillRef} />;
};

// eslint-disable-next-line react-refresh/only-export-components
export { DEFAULT_TOOLBAR_TITLE, DEFAULT_TOOLBAR_BODY };
export default QuillKeywordEditor;
