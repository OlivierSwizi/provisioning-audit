import { message, Select } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import logger from "@/logger";
import { API } from "@/services/features/AuthSlice";
import { useTranslation } from "react-i18next";

const GroupSelector = ({
  value,
  onChange,
  style = {},
  mode,
  size = "small",
  excludedGroupIds,
  excludeParent = false,
  onlyParent = false,
  includeGlobalGroups = false,
}) => {
  const [options, setOptions] = useState([]);
  const api = useSelector(API);
  const appId = useSelector((state) => state.apps.selectedApp.id);

  const { t } = useTranslation();

  useEffect(() => {
    const doIt = async () => {
      try {
        const groups = await api.groups.searchGroups({
          filter: "",
          page: 1,
          pageSize: 1000,
          includeGlobalGroups,
        });
        setOptions(
          groups.items
            .filter((group) => !excludedGroupIds || !excludedGroupIds.includes(group.id))
            .filter((group) => !excludeParent || group.type !== "COMPOSIT")
            .filter((group) => !onlyParent || group.type === "COMPOSIT")
            .map((group) => ({ value: group.id, label: group.label }))
            .sort((a, b) => a.label.localeCompare(b.label)),
        );
      } catch (err) {
        message.error(t("api-error"));
        logger.error(err);
      }
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, onlyParent, excludeParent, excludedGroupIds]);

  const handleChange = (v) => {
    onChange(v);
  };

  return (
    <Select
      options={options}
      value={value}
      onChange={handleChange}
      style={style}
      mode={mode}
      size={size}
    />
  );
};

export default GroupSelector;
