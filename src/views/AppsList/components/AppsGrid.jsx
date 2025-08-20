// FILENAME: src/views/AppsList/components/AppsGrid.jsx
import PropTypes from "prop-types";
import { List } from "antd";
import { useTranslation } from "react-i18next";
import AppCard from "./AppCard";

export default function AppsGrid({ items, onOpen }) {
  const { t } = useTranslation();

  // Config unique (style "comfort")
  const gridCfg = { gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 5, minWidth: 230 };

  return (
    <List
      grid={{
        gutter: gridCfg.gutter,
        xs: gridCfg.xs,
        sm: gridCfg.sm,
        md: gridCfg.md,
        lg: gridCfg.lg,
        xl: gridCfg.xl,
        xxl: gridCfg.xxl,
      }}
      dataSource={items}
      renderItem={(app) => (
        <List.Item key={app?.id} style={{ minWidth: gridCfg.minWidth }}>
          <AppCard app={app} onOpen={onOpen} />
        </List.Item>
      )}
      locale={{ emptyText: t("apps-list.empty", "No project") }}
      style={{ width: "100%" }}
    />
  );
}

AppsGrid.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object),
  onOpen: PropTypes.func,
};

AppsGrid.defaultProps = {
  items: [],
  onOpen: undefined,
};
