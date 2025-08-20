import { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as htmlLang } from "@codemirror/lang-html";
import { EditorView, keymap, ViewPlugin } from "@codemirror/view";
import { StateField, RangeSetBuilder } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import { autocompletion } from "@codemirror/autocomplete";
import { Button, Space } from "antd";
import { useSelectPublicMediaModal } from "@/components/modal/SelectPublicMediaModal";

/**
 * CodeKeywordEditor (CodeMirror 6)
 * Props:
 *  - value: string
 *  - onChange: (code: string) => void
 *  - placeholder?: string
 *  - keywords?: string[]
 *  - singleLine?: boolean
 *  - height?: number|string   // e.g., 520 or "100%"
 *  - onOpenKeywordMenu?: ({ view, range:{from,to}, position:{top,left}, replaceTrigger:boolean }) => void
 *  - enableMediaPicker?: boolean (default false)
 */
const CodeKeywordEditor = ({
  value = "",
  onChange,
  placeholder,
  singleLine = false,
  height,
  onOpenKeywordMenu,
  enableMediaPicker = false,
}) => {
  const [code, setCode] = useState(value);
  const viewRef = useRef(null);

  // Hook modal media picker
  const [askSelect, SelectPublicMediaModal] = useSelectPublicMediaModal();

  const TOKEN_RE = /{{\s*([^{}\s][^{}]*?)\s*}}/g;
  const tokenClass = "cm-keyword-token";

  const buildDecorations = (doc) => {
    const builder = new RangeSetBuilder();
    const text = doc.toString();
    let m;
    while ((m = TOKEN_RE.exec(text)) !== null) {
      builder.add(m.index, m.index + m[0].length, Decoration.mark({ class: tokenClass }));
    }
    return builder.finish();
  };

  const keywordField = StateField.define({
    create(state) {
      return buildDecorations(state.doc);
    },
    update(deco, tr) {
      return tr.docChanged ? buildDecorations(tr.state.doc) : deco;
    },
    provide: (f) => EditorView.decorations.from(f),
  });

  const theme = EditorView.baseTheme({
    ".cm-content": {
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: "13px",
    },
    ".cm-scroller": { overflow: "auto" },
    [`.${tokenClass}`]: {
      backgroundColor: "#ffebee",
      color: "#b71c1c",
      borderRadius: "4px",
      padding: "0 2px",
      cursor: "pointer",
      fontWeight: 500,
    },
  });

  const openMenuOnDoubleBrace = ViewPlugin.fromClass(
    class {
      update(update) {
        if (!update.docChanged) return;
        const pos = update.state.selection.main.head;
        const before = update.state.doc.sliceString(Math.max(0, pos - 2), pos);
        if (before === "{{" && onOpenKeywordMenu) {
          const rect = update.view.coordsAtPos(pos);
          if (rect) {
            onOpenKeywordMenu({
              view: update.view,
              range: { from: pos - 2, to: pos },
              position: { top: rect.bottom, left: rect.left }, // viewport coords
              replaceTrigger: true,
            });
          }
        }
      }
    },
  );

  const clickTokenHandler = EditorView.domEventHandlers({
    click: (event, view) => {
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (pos == null) return;
      const text = view.state.doc.toString();
      let m;
      while ((m = TOKEN_RE.exec(text)) !== null) {
        const from = m.index;
        const to = m.index + m[0].length;
        if (pos >= from && pos <= to) {
          const rect = view.coordsAtPos(to);
          if (rect && onOpenKeywordMenu) {
            onOpenKeywordMenu({
              view,
              range: { from, to },
              position: { top: rect.bottom, left: rect.left }, // viewport coords
              replaceTrigger: false,
            });
          }
          break;
        }
      }
    },
  });

  const extensions = useMemo(() => {
    const exts = [
      htmlLang(),
      theme,
      keywordField,
      openMenuOnDoubleBrace,
      clickTokenHandler,
      autocompletion(),
      EditorView.lineWrapping,
    ];
    if (singleLine) {
      exts.push(
        keymap.of([
          {
            key: "Enter",
            preventDefault: true,
            run: () => true,
          },
        ]),
      );
    }
    if (placeholder) {
      exts.push(EditorView.editorAttributes.of({ "aria-label": placeholder }));
    }
    return exts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [singleLine, placeholder]);

  useEffect(() => {
    setCode(value || "");
  }, [value]);

  const cmHeight =
    height != null
      ? typeof height === "number"
        ? `${height}px`
        : height
      : singleLine
      ? "44px"
      : "420px";

  // Toolbar action: open picker and insert URL at caret (in THIS editor)
  const handleInsertImage = async () => {
    const url = await askSelect();
    if (!url || !viewRef.current) return;
    const view = viewRef.current;
    const { from, to } = view.state.selection.main;
    const insert = `${url} `;
    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: from + insert.length },
    });
    // ensure local/state + parent onChange are in sync immediately
    const nextCode = view.state.doc.toString();
    setCode(nextCode);
    onChange?.(nextCode);
    view.focus();
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        overflow: "hidden",
        height: cmHeight === "100%" ? "100%" : "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Toolbar (optional, a bit taller) */}
      {enableMediaPicker && (
        <div
          style={{
            padding: "8px 10px",
            borderBottom: "1px solid #f0f0f0",
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 40,
          }}
        >
          <Space size={8}>
            <Button size="small" onClick={handleInsertImage}>
              Insert image
            </Button>
          </Space>
          <div />
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0 }}>
        <CodeMirror
          value={code}
          height={cmHeight === "100%" ? "100%" : cmHeight}
          basicSetup={{
            lineNumbers: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
          }}
          extensions={extensions}
          onChange={(val) => {
            setCode(val);
            onChange?.(val);
          }}
          onCreateEditor={(view) => {
            viewRef.current = view;
          }}
        />
      </div>

      {/* Modal for public media selection */}
      {SelectPublicMediaModal}
    </div>
  );
};

export default CodeKeywordEditor;
