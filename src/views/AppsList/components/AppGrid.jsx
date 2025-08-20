// FILENAME: src/components/AppGrid.jsx
import React from "react";
import PropTypes from "prop-types";
import { List, Card, Typography, Tooltip } from "antd";

const { Text } = Typography;

/**
 * Grille d’apps compacte & responsive.
 * - On affiche exactement la liste reçue via `items` (ex: ton `filtered`)
 * - ID copiable (#id)
 * - Logo si disponible (logoUrl | logo | iconUrl | imageUrl)
 * - Grille responsive (pas une colonne unique)
 */
export default function AppGrid({ items, onOpen }) {
  const handleOpen = (app) => {
    if (onOpen) onOpen(app);
  };

  const renderCard = (app) => {
    const logoSrc = app?.logoUrl || app?.logo || app?.iconURL || app?.imageUrl || null;
    const title = app?.name ?? "";
    const idText = app?.id != null ? String(app.id) : "";

    return (
      <Card
        hoverable
        bordered={false}
        onClick={() => handleOpen(app)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpen(app);
          }
        }}
        style={{
          height: 110,
          display: "flex",
          alignItems: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          borderRadius: 10,
        }}
        bodyStyle={{ width: "100%", padding: 12 }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", minWidth: 0 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flex: "0 0 auto",
            }}
            aria-hidden
          >
            {logoSrc ? (
              <img
                src={logoSrc}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            ) : (
              <Text strong style={{ fontSize: 18 }}>
                {String(title || "S")
                  .slice(0, 1)
                  .toUpperCase()}
              </Text>
            )}
          </div>

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
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
        `}</style>
      </Card>
    );
  };

  return (
    <List
      grid={{
        gutter: 12,
        xs: 1,
        sm: 2,
        md: 3,
        lg: 4,
        xl: 5,
        xxl: 6,
      }}
      dataSource={items}
      renderItem={(app) => (
        <List.Item key={app?.id} style={{ minWidth: 260 }}>
          {renderCard(app)}
        </List.Item>
      )}
      locale={{ emptyText: "Aucun élément" }}
      style={{ width: "100%" }}
    />
  );
}

AppGrid.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  onOpen: PropTypes.func, // (app) => void
};

AppGrid.defaultProps = {
  items: [],
  onOpen: undefined,
};
