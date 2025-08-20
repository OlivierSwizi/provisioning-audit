// FILENAME: src/views/AppsList/components/AppCard.jsx
import PropTypes from "prop-types";
import { Card, Typography, Tooltip, Avatar } from "antd";
import { useState } from "react";

const { Text } = Typography;

function stringToColor(str) {
  if (!str) return "#dfe6ef";
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    // eslint-disable-next-line no-bitwise
    hash &= hash;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 46%, 78%)`;
}

function getInitials(name) {
  if (!name) return "S";
  const parts = String(name)
    .trim()
    .split(/\s|[-_/]+/u)
    .filter(Boolean);
  const letters =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : parts
          .slice(0, 2)
          .map((p) => p[0])
          .join("");
  return letters.toUpperCase();
}

export default function AppCard({ app, onOpen }) {
  const title = app?.name ?? "";
  const idText = app?.id != null ? String(app.id) : "";
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(app?.logoURL) && !imgError;

  // Style "comfort" retenu
  const SIZES = { cardH: 124, pad: 14, gap: 14, logo: 64, radius: 14, title: 16, meta: 13 };

  return (
    <Card
      hoverable
      bordered={false}
      onClick={() => onOpen && onOpen(app)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onOpen) onOpen(app);
        }
      }}
      style={{
        height: SIZES.cardH,
        display: "flex",
        alignItems: "center",
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        transition: "box-shadow .15s ease, transform .15s ease",
      }}
      bodyStyle={{ width: "100%", padding: SIZES.pad }}
      className="appcard"
    >
      <div
        style={{
          display: "flex",
          gap: SIZES.gap,
          alignItems: "center",
          width: "100%",
          minWidth: 0,
        }}
      >
        <div
          style={{
            width: SIZES.logo,
            height: SIZES.logo,
            borderRadius: SIZES.radius,
            background: "#fff",
            border: "1px solid #EDF0F5",
            boxShadow: "inset 0 0 0 6px #F5F7FA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flex: "0 0 auto",
          }}
          aria-hidden
        >
          {showImage ? (
            <img
              src={app.logoURL}
              alt=""
              loading="lazy"
              onError={() => setImgError(true)}
              style={{ width: "90%", height: "90%", objectFit: "contain" }}
            />
          ) : (
            <Avatar
              shape="square"
              size={SIZES.logo}
              style={{
                borderRadius: SIZES.radius - 2,
                backgroundColor: stringToColor(title),
                color: "#1a2b3c",
                fontWeight: 700,
                fontSize: 20,
                lineHeight: `${SIZES.logo}px`,
              }}
            >
              {getInitials(title)}
            </Avatar>
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <Tooltip title={title}>
            <Text strong style={{ display: "block", fontSize: SIZES.title }} ellipsis>
              {title}
            </Text>
          </Tooltip>
          {idText ? (
            <Text
              type="secondary"
              style={{ fontSize: SIZES.meta }}
              copyable={{ text: idText }}
              ellipsis
            >
              #{idText}
            </Text>
          ) : null}
        </div>
      </div>

      <style>{`
        .appcard:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
        .appcard:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }
      `}</style>
    </Card>
  );
}

AppCard.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    logoURL: PropTypes.string,
  }).isRequired,
  onOpen: PropTypes.func,
};

AppCard.defaultProps = {
  onOpen: undefined,
};
