// FILENAME: src/components/ViewModeToggle.jsx
import PropTypes from "prop-types";
import { Segmented, Tooltip } from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

export default function ViewModeToggle({ value, onChange, size }) {
  const { t } = useTranslation();
  return (
    <Segmented
      size={size}
      value={value}
      onChange={onChange}
      options={[
        {
          label: (
            <Tooltip title={t("apps-list.view.grid", "Grid")}>
              <AppstoreOutlined />
            </Tooltip>
          ),
          value: "grid",
        },
        {
          label: (
            <Tooltip title={t("apps-list.view.list", "List")}>
              <BarsOutlined />
            </Tooltip>
          ),
          value: "list",
        },
      ]}
    />
  );
}

ViewModeToggle.propTypes = {
  value: PropTypes.oneOf(["grid", "list"]).isRequired,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.oneOf(["small", "middle", "large"]),
};

ViewModeToggle.defaultProps = {
  size: "small",
};
