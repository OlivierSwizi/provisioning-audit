// FILENAME: src/views/AppsList/components/AppCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { Card, Typography, Tooltip, Avatar } from "antd";

const { Text } = Typography;

/** Couleur douce déterministe basée sur le nom (pas de dépendance externe). */
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
  return `hsl(${hue}, 45%, 78%)`;
}

/** Extrait 1–3 initiales d’un nom d’app. */
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
          .slice(0, 3)
          .map((p) => p[0])
          .join("");
  return letters.toUpperCase();
}

export default function AppCard({ app, onClick }) {
  const title = app?.name ?? "";
  const idText = app?.id != null ? String(app.id) : "";
  const [imgError, setImgError] = React.useState(false);

  const showImage = Boolean(app?.logoURL) && !imgError;

  return (
    <Card
      hoverable
      bordered={false}
      onClick={() => onClick && onClick(app)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (onClick) onClick(app);
        }
      }}
      style={{
        height: 110,
        display: "flex",
        alignItems: "center",
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
      }}
      bodyStyle={{ width: "100%", padding: 12 }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", minWidth: 0 }}>
        {/* Logo ou fallback initiales */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: "#f5f5f5",
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
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <Avatar
              shape="square"
              size={52}
              style={{
                borderRadius: 12,
                backgroundColor: stringToColor(title),
                color: "#1a2b3c",
                fontWeight: 700,
                fontSize: 18,
                lineHeight: "52px",
              }}
            >
              {getInitials(title)}
            </Avatar>
          )}
        </div>

        {/* Titre + ID copiable */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <Tooltip title={title}>
            <Text strong style={{ display: "block" }} ellipsis>
              {title}
            </Text>
          </Tooltip>
          {idText ? (
            <Text type="secondary" style={{ fontSize: 12 }} copyable={{ text: idText }} ellipsis>
              #{idText}
            </Text>
          ) : null}
        </div>
      </div>

      <style>{`
        .ant-card-hoverable:hover {
          transform: translateY(-1px);
          transition: transform .15s ease, box-shadow .15s ease;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }
      `}</style>
    </Card>
  );
}

AppCard.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    logoURL: PropTypes.string, // image principale attendue
  }).isRequired,
  onClick: PropTypes.func,
};

AppCard.defaultProps = {
  onClick: undefined,
};
