import { Tag, Tooltip } from "antd";
import { useTranslation } from "react-i18next";

const NETWORK_COLORS = {
  AZURE_AD: { color: "blue", label: "AZURE AD" },
  SWIZI: { color: "purple", label: "  SWIZI  " },
  API: { color: "gold", label: "   API   " },
  SCIM: { color: "orange", label: "  SCIM   " },
  COMPOSIT: { color: "green", label: "COMPOSITE" },
};

const NetworkTypeTag = ({ type }) => {
  const { t } = useTranslation();
  return (
    <Tooltip title={t("group-user-type")}>
      <Tag
        color={NETWORK_COLORS[type]?.color}
        style={{
          fontSize: "8px",
          padding: "8px",
          lineHeight: "unset",
          height: "30px",
          cursor: "default",
        }}
      >
        {NETWORK_COLORS[type]?.label}
      </Tag>
    </Tooltip>
  );
};

export default NetworkTypeTag;
