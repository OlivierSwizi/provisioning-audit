// @/components/template-editors/components/KeywordMenu.jsx
import { useEffect, useRef, useState } from "react";
import { Card } from "antd";

/**
 * KeywordMenu
 * Props:
 *  - visible: boolean
 *  - position: { top:number, left:number }  // viewport coordinates (px)
 *  - keywords: string[]
 *  - onSelect: (key:string) => void
 *  - onClose: () => void
 */
const KeywordMenu = ({
  visible,
  position = { top: 0, left: 0 },
  keywords = [],
  onSelect,
  onClose,
}) => {
  const wrapRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset index when opening
  useEffect(() => {
    if (visible) setActiveIndex(0);
  }, [visible, keywords]);

  // Close on outside click (capture phase to be first)
  useEffect(() => {
    if (!visible) return;
    const handleDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        onClose?.();
      }
    };
    document.addEventListener("mousedown", handleDown, true);
    return () => document.removeEventListener("mousedown", handleDown, true);
  }, [visible, onClose]);

  // Keyboard nav: Up/Down/Enter/Escape
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (!visible) return;
      if (e.key === "Escape") {
        onClose?.();
        return;
      }
      if (keywords.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % keywords.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + keywords.length) % keywords.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const k = keywords[activeIndex];
        if (k) onSelect?.(k);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, keywords, activeIndex, onSelect, onClose]);

  if (!visible) return null;

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed", // expects viewport coordinates
        top: position.top,
        left: position.left,
        zIndex: 10000,
      }}
      // Keep editor focus: avoid blurring on menu clicks/drags
      onMouseDown={(e) => e.preventDefault()}
    >
      <Card
        size="small"
        bodyStyle={{ padding: 6 }}
        style={{ borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: 220 }}
      >
        <div style={{ display: "grid", gap: 2 }}>
          {keywords
            .sort((a, b) => a.localeCompare(b))
            .map((k, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => onSelect?.(k)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    border: 0,
                    background: active ? "#e6f4ff" : "transparent",
                    padding: "6px 8px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  {k}
                </button>
              );
            })}
          {keywords.length === 0 && (
            <div style={{ padding: "6px 8px", color: "#8c8c8c", fontSize: 13 }}>(no keywords)</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default KeywordMenu;
