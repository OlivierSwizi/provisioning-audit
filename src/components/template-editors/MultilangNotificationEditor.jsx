import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Space, Button, Dropdown, Menu, Select, Tag, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import { DeleteOutlined, PlusOutlined, DownOutlined } from "@ant-design/icons";

import QuillKeywordEditor from "@/components/template-editors/components/QuillKeywordEditor";
import KeywordMenu from "@/components/template-editors/components/KeywordMenu";
import "@/components/template-editors/styles/quill.css";

/**
 * MultilangNotificationEditor
 *
 * Props:
 * - title: string
 * - keywords: string[]
 * - value: Array<{ locale: string, title?: string, message?: string, subject?: string, body?: string }>
 * - onChange: (nextArray) => void
 * - fieldMap?: { titleField?: string, bodyField?: string }  // defaults: { titleField: "title", bodyField: "message" }
 * - defaultLocales?: string[]                   // default: ["fr","en"] (not removable)
 * - allowedLocales?: string[]                   // default list for "add language"
 * - showToolbar?: boolean                       // default: false
 */

const DEFAULT_ALLOWED = ["fr", "en", "nl", "de", "es", "it", "pt", "pl"];

const normalizeItem = (item, fm) => ({
  locale: item.locale,
  title: item[fm.titleField] ?? "",
  message: item[fm.bodyField] ?? "",
});

const denormalizeItem = (item, fm) => ({
  locale: item.locale,
  [fm.titleField]: item.title ?? "",
  [fm.bodyField]: item.message ?? "",
});

const shallowNormalize = (arr, fm) => (arr || []).map((x) => normalizeItem(x, fm));

const isSameItems = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].locale !== b[i].locale) return false;
    if (a[i].title !== b[i].title) return false;
    if (a[i].message !== b[i].message) return false;
  }
  return true;
};

const MultilangNotificationEditor = ({
  title,
  keywords = [],
  value = [],
  onChange,
  fieldMap = { titleField: "title", bodyField: "message" },
  defaultLocales = ["fr", "en"],
  allowedLocales = DEFAULT_ALLOWED,
  showToolbar = false,
}) => {
  const { t } = useTranslation();

  // ---------- state (with safe sync from props.value)
  const fm = useMemo(
    () => ({
      titleField: fieldMap.titleField || "title",
      bodyField: fieldMap.bodyField || "message",
    }),
    [fieldMap.titleField, fieldMap.bodyField],
  );

  const [items, setItems] = useState(() => shallowNormalize(value, fm));
  const [activeLocale, setActiveLocale] = useState(() => {
    const first = (value && value[0]?.locale) || "fr";
    return first;
  });

  // guard to avoid value ⇄ onChange loop
  const updatingRef = useRef(false);

  useEffect(() => {
    if (updatingRef.current) {
      updatingRef.current = false;
      return;
    }
    const next = shallowNormalize(value, fm);
    if (!isSameItems(items, next)) {
      setItems(next);
      if (next.length && !next.some((x) => x.locale === activeLocale)) {
        setActiveLocale(next[0].locale);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, fm.titleField, fm.bodyField]);

  const pushChange = (nextItems) => {
    if (isSameItems(items, nextItems)) return;
    updatingRef.current = true;
    setItems(nextItems);
    const denorm = nextItems.map((it) => denormalizeItem(it, fm));
    onChange?.(denorm);
  };

  const ensureLocale = (lc) => {
    const found = items.find((x) => x.locale === lc);
    if (found) return items;
    const next = [...items, { locale: lc, title: "", message: "" }];
    return next;
  };

  // ---------- keyword menu (shared for both editors)
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const menuContextRef = useRef({ quill: null, range: null, replaceTrigger: false });
  const insertingRef = useRef(false);

  /**
   * IMPORTANT: Quill.getBounds() renvoie des coordonnées RELATIVES au conteneur de l'éditeur.
   * Notre KeywordMenu est en position: fixed → il attend des coordonnées VIEWPORT.
   * On convertit donc: viewport = editorContainer.getBoundingClientRect() + localBounds
   */
  const openKeywordMenu = ({ quill, range, position, replaceTrigger }) => {
    if (!keywords?.length) return;

    let top = position?.top || 0;
    let left = position?.left || 0;

    try {
      const container = quill?.container || quill?.root?.parentElement || quill?.root;
      if (container && container.getBoundingClientRect) {
        const rect = container.getBoundingClientRect();
        top = rect.top + top;
        left = rect.left + left;
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (_) {
      // si on ne peut pas calculer, on garde la position telle quelle
    }

    // petit offset pour éviter de recouvrir le caret
    top += 6;

    menuContextRef.current = { quill, range, replaceTrigger };
    setMenuPos({ top, left });
    setMenuVisible(true);
  };

  const closeKeywordMenu = () => setMenuVisible(false);

  const handleKeywordPick = (key) => {
    if (insertingRef.current) return;
    insertingRef.current = true;

    const ctx = menuContextRef.current;
    if (!ctx?.quill) {
      insertingRef.current = false;
      return;
    }
    const { quill, range, replaceTrigger } = ctx;

    let startIndex = range.index;
    let deleteLen = range.length || 0;
    if (replaceTrigger) {
      startIndex = Math.max(0, range.index - 2); // remove '{{'
      deleteLen = 2;
    }

    quill.deleteText(startIndex, deleteLen, "user");
    quill.insertEmbed(startIndex, "keyword", key, "user");
    quill.insertText(startIndex + 1, " ", "user");

    const caretIndex = startIndex + 2;
    quill.update("silent");
    setTimeout(() => {
      quill.setSelection(caretIndex, 0, "silent");
      quill.focus();
      insertingRef.current = false;
    }, 0);

    setMenuVisible(false);
  };

  // ---------- computed
  const locales = useMemo(() => items.map((x) => x.locale), [items]);
  const current = items.find((x) => x.locale === activeLocale) || {
    locale: activeLocale,
    title: "",
    message: "",
  };

  // ---------- actions
  const onChangeField = (field, html) => {
    const next = items.map((it) => (it.locale === activeLocale ? { ...it, [field]: html } : it));
    pushChange(next);
  };

  const handleCopyFrom = (srcLocale) => {
    const src = items.find((x) => x.locale === srcLocale);
    if (!src) return;
    const next = items.map((it) =>
      it.locale === activeLocale ? { ...it, title: src.title, message: src.message } : it,
    );
    pushChange(next);
  };

  const handleAddLocale = (lc) => {
    const next = ensureLocale(lc);
    pushChange(next);
    setActiveLocale(lc);
  };

  const handleRemoveLocale = (lc) => {
    if (defaultLocales.includes(lc)) return;
    const next = items.filter((x) => x.locale !== lc);
    pushChange(next);
    if (activeLocale === lc && next.length) setActiveLocale(next[0].locale);
  };

  // ---------- UI helpers
  const copyMenu = (
    <Menu
      items={locales
        .filter((lc) => lc !== activeLocale)
        .map((lc) => ({
          key: lc,
          label: lc.toUpperCase(),
          onClick: () => handleCopyFrom(lc),
        }))}
    />
  );

  const addOptions = allowedLocales
    .filter((lc) => !locales.includes(lc))
    .map((lc) => ({ label: lc.toUpperCase(), value: lc }));

  // ---------- render
  return (
    <Card
      title={title}
      style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}
      bodyStyle={{ padding: 16 }}
    >
      {/* LANG BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        {/* locales pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {locales.map((lc) => {
            const isActive = lc === activeLocale;
            const isLocked = defaultLocales.includes(lc);
            return (
              <div key={lc} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Tag
                  color={isActive ? "orange" : "default"}
                  onClick={() => setActiveLocale(lc)}
                  style={{
                    cursor: "pointer",
                    marginRight: 0,
                    padding: "4px 10px",
                    borderRadius: 16,
                  }}
                >
                  {lc.toUpperCase()}
                </Tag>
                {!isLocked && (
                  <Tooltip title={t("templateEditor.delete", "Delete")}>
                    <Button
                      aria-label={t("templateEditor.delete", "Delete")}
                      size="small"
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveLocale(lc)}
                    />
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>

        {/* spacer */}
        <div style={{ flex: 1 }} />

        {/* actions aligned right */}
        <Space>
          <Dropdown overlay={copyMenu} trigger={["click"]}>
            <Button>
              {t("templateEditor.copyFrom", "Copy from")} <DownOutlined />
            </Button>
          </Dropdown>

          <Select
            style={{ minWidth: 220 }}
            placeholder={t("templateEditor.addLanguage", "Add language")}
            options={addOptions}
            onSelect={(v) => handleAddLocale(v)}
            value={undefined}
            suffixIcon={<PlusOutlined />}
          />
        </Space>
      </div>

      {/* EDITORS */}
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* Title */}
        <div>
          <div className="editor-label">{t("templateEditor.subject", "Subject")}</div>
          <div className="editor-wrap">
            <QuillKeywordEditor
              value={current.title}
              onChange={(html) => onChangeField("title", html)}
              placeholder={t("templateEditor.subject", "Subject")}
              showToolbar={showToolbar}
              size="small" // min 1 line
              editorType="title"
              onOpenKeywordMenu={openKeywordMenu}
              keywords={keywords}
            />
          </div>
        </div>

        {/* Body */}
        <div>
          <div className="editor-label">{t("templateEditor.message", "Message")}</div>
          <div className="editor-wrap">
            <QuillKeywordEditor
              value={current.message}
              onChange={(html) => onChangeField("message", html)}
              placeholder={t("templateEditor.message", "Message")}
              showToolbar={showToolbar}
              size="normal" // min 3 lines
              editorType="body"
              onOpenKeywordMenu={openKeywordMenu}
              keywords={keywords}
            />
          </div>
        </div>

        {/* Help text */}
        <div style={{ marginTop: 4, fontSize: 12, color: "#9aa0a6" }}>
          {t("templateEditor.help", "To insert a keyword, type {{ or click on an existing keyword")}
        </div>
      </Space>

      {/* Shared keyword menu */}
      <KeywordMenu
        visible={menuVisible}
        position={menuPos}
        keywords={keywords}
        onSelect={handleKeywordPick}
        onClose={closeKeywordMenu}
      />
    </Card>
  );
};

export default MultilangNotificationEditor;
