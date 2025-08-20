// FILENAME: src/views/AppsList/components/AppsListRows.jsx
import PropTypes from "prop-types";
import { List, Typography, Tooltip, Avatar } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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

export default function AppsListRows({ items, onOpen }) {
  const { t } = useTranslation();
  return (
    <List
      itemLayout="horizontal"
      dataSource={items}
      style={{ width: "100%" }}
      renderItem={(app) => {
        const title = app?.name ?? "";
        const idText = app?.id != null ? String(app.id) : "";
        const [err, setErr] = useState(false);
        const hasImg = !!app?.logoURL && !err;

        return (
          <List.Item
            key={app?.id}
            onClick={() => onOpen && onOpen(app)}
            style={{
              cursor: "pointer",
              borderRadius: 10,
              background: "#fff",
              padding: "10px 12px",
              marginBottom: 8,
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <List.Item.Meta
              avatar={
                hasImg ? (
                  <img
                    src={app.logoURL}
                    alt=""
                    onError={() => setErr(true)}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "contain",
                      borderRadius: 8,
                      background: "#fff",
                      border: "1px solid #EDF0F5",
                      padding: 4,
                    }}
                  />
                ) : (
                  <Avatar
                    shape="square"
                    size={40}
                    style={{
                      borderRadius: 8,
                      backgroundColor: stringToColor(title),
                      color: "#1a2b3c",
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(title)}
                  </Avatar>
                )
              }
              title={
                <Tooltip title={title}>
                  <Text strong style={{ fontSize: 15 }} ellipsis>
                    {title}
                  </Text>
                </Tooltip>
              }
              description={
                idText ? (
                  <Text type="secondary" style={{ fontSize: 12 }} copyable={{ text: idText }}>
                    #{idText}
                  </Text>
                ) : null
              }
            />
          </List.Item>
        );
      }}
      locale={{ emptyText: t("apps-list.empty", "No project") }}
    />
  );
}

AppsListRows.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  onOpen: PropTypes.func,
};
AppsListRows.defaultProps = {
  items: [],
  onOpen: undefined,
};
