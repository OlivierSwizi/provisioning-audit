import { Select } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "@/services/features/AuthSlice";

const SiteSelector = ({ value, onChange, style = {}, mode, size = "small", allowClear = true }) => {
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!appId) return;

    const doIt = async () => {
      const sites = (await api.apps.getAppSites(appId)) || [];
      setOptions(
        sites
          .map((site) => ({ value: site.id, label: site.label }))
          .sort((a, b) => (a.label || "").localeCompare(b.label)),
      );

      if (!value) {
        onChange(sites[0]?.id);
      }
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      style={style}
      mode={mode}
      size={size}
      allowClear={allowClear}
    />
  );
};

export default SiteSelector;
