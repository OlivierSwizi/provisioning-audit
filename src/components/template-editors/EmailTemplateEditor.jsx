import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Button, Layout } from "antd";
import { useTranslation } from "react-i18next";

import CodeKeywordEditor from "@/components/template-editors/components/CodeKeywordEditor";
import KeywordMenu from "@/components/template-editors/components/KeywordMenu";
import "@/components/template-editors/styles/quill.css";
import "@/components/template-editors/styles/code-editor.css";

const { Sider, Content } = Layout;

/**
 * EmailTemplateEditor (CodeMirror + keywords + live side preview)
 *
 * Props:
 * - title: string
 * - keywords: string[]
 * - value: { subject: string, content: string }
 * - onChange: (next: { subject: string, content: string }) => void
 * - previewEnabled?: boolean (default true)
 */
const EmailTemplateEditor = ({
  title,
  keywords = [],
  value = { subject: "", content: "" },
  onChange,
  previewEnabled = true,
}) => {
  const { t } = useTranslation();

  const [subject, setSubject] = useState(value?.subject || "");
  const [content, setContent] = useState(value?.content || "");

  const [previewOpen, setPreviewOpen] = useState(false);

  // Shared keyword menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuCtxRef = useRef({ view: null, range: null, replaceTrigger: false });

  // sync from parent only when it really changed
  useEffect(() => {
    setSubject((prev) => (prev === (value?.subject || "") ? prev : value?.subject || ""));
    setContent((prev) => (prev === (value?.content || "") ? prev : value?.content || ""));
  }, [value?.subject, value?.content]);

  const emit = (nextSubject, nextContent) => {
    onChange?.({
      subject: nextSubject ?? subject,
      content: nextContent ?? content,
    });
  };

  const handleOpenKeywordMenu = ({ view, range, position, replaceTrigger }) => {
    if (!keywords?.length) return;
    menuCtxRef.current = { view, range, replaceTrigger };
    setMenuPos(position); // viewport coords
    setMenuVisible(true);
  };

  const insertAtCaretFromCtx = (text) => {
    const ctx = menuCtxRef.current;
    if (!ctx?.view) return;
    const { view, range } = ctx;
    const from = range?.from ?? view.state.selection.main.from;
    const to = range?.to ?? view.state.selection.main.to;
    const insert = `${text} `;
    view.dispatch({
      changes: { from, to, insert },
      selection: { anchor: from + insert.length },
    });
    view.focus();
  };

  const onKeywordPick = (key) => {
    insertAtCaretFromCtx(`{{${key}}}`);
    setMenuVisible(false);
  };

  const previewHtml = useMemo(() => content || "", [content]);

  return (
    <Card
      title={title}
      style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", height: "100%" }}
      bodyStyle={{
        padding: 0,
        display: "flex",
        flexDirection: "row",
        minHeight: 0,
      }}
      extra={
        previewEnabled ? (
          <Button size="small" onClick={() => setPreviewOpen((o) => !o)}>
            {t("emailEditor.preview", "Preview")}
          </Button>
        ) : null
      }
    >
      <Layout style={{ flex: 1, minHeight: 0, background: "transparent" }}>
        <Content
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            gap: 16,
          }}
        >
          {/* SUBJECT — media picker disabled here */}
          <div>
            <div className="editor-label">{t("emailEditor.subjectLabel", "Subject")}</div>
            <CodeKeywordEditor
              value={subject}
              onChange={(val) => {
                setSubject(val);
                emit(val, null);
              }}
              placeholder={t(
                "emailEditor.subjectPlaceholder",
                "Enter the email subject (you can use {{keyword}})",
              )}
              singleLine
              height={52}
              keywords={keywords}
              onOpenKeywordMenu={handleOpenKeywordMenu}
              enableMediaPicker={false} // <-- no image insert in subject
            />
          </div>

          {/* BODY — media picker enabled */}
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div className="editor-label" style={{ marginBottom: 8 }}>
              {t("emailEditor.bodyLabel", "Body (HTML)")}
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <CodeKeywordEditor
                value={content}
                onChange={(val) => {
                  setContent(val);
                  emit(null, val);
                }}
                placeholder={t(
                  "emailEditor.bodyPlaceholder",
                  "Write your email HTML (you can use {{keyword}})",
                )}
                height="100%"
                keywords={keywords}
                onOpenKeywordMenu={handleOpenKeywordMenu}
                enableMediaPicker // <-- allowed in body
              />
            </div>
          </div>

          {/* Help */}
          <div style={{ fontSize: 12, color: "#9aa0a6" }}>
            {t(
              "emailEditor.helpText",
              "To insert a keyword, type {{ or click on an existing keyword.",
            )}
          </div>
        </Content>

        {previewEnabled && (
          <Sider
            collapsible
            collapsed={!previewOpen}
            collapsedWidth={0}
            width={640}
            trigger={null}
            style={{ background: "#fafafa", borderLeft: "1px solid #e5e7eb" }}
          >
            <div style={{ padding: 16, height: "100%", overflow: "auto" }}>
              <div style={{ fontSize: 12, color: "#595959", marginBottom: 6 }}>
                {t("emailEditor.subjectLabel", "Subject")}
              </div>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "8px 10px",
                  background: "#fff",
                  fontWeight: 500,
                  wordBreak: "break-word",
                  marginBottom: 16,
                }}
              >
                {subject}
              </div>

              <div style={{ fontSize: 12, color: "#595959", marginBottom: 6 }}>
                {t("emailEditor.bodyLabel", "Body (HTML)")}
              </div>
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: 16,
                  minHeight: 220,
                  background: "#fff",
                }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </Sider>
        )}
      </Layout>

      <KeywordMenu
        visible={menuVisible}
        position={menuPos}
        keywords={keywords}
        onSelect={onKeywordPick}
        onClose={() => setMenuVisible(false)}
      />
    </Card>
  );
};

export default EmailTemplateEditor;
