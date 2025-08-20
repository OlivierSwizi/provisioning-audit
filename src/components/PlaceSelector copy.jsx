import { Input } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDebounce } from "use-debounce";

import { API } from "@/services/features/AuthSlice";
import { useTranslation } from "react-i18next";
import { extractLocalizedString } from "@/helpers";

const GroupSelector = ({ value, onChange, onError, siteId, isError = false }) => {
  const api = useSelector(API);
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const [reference, setReference] = useState("");
  const [label, setLabel] = useState("");

  const [debounceReference] = useDebounce(reference, 500);

  const { i18n } = useTranslation();
  const lng = i18n.language.split("-")[0];
  0;
  const testLocation = async () => {
    if (!reference) {
      setLabel("");
      return onError(true);
    }

    try {
      const location = await api.features.places.checkLocation(siteId, reference);
      setLabel(extractLocalizedString(location.title, lng, "content"));
      onError(false);

      if (location.reference !== value?.placeId)
        onChange({
          placeId: location.reference,
          name: location.title,
        });
      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      setLabel("");
      onError(true);
    }
  };

  useEffect(() => {
    setReference(value?.placeId || "");
  }, [appId, siteId, value]);

  useEffect(() => {
    if (!debounceReference) return;
    testLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceReference]);

  return (
    <div>
      <Input
        value={reference}
        onChange={(e) => {
          setReference(e.target.value);
        }}
        onBlur={testLocation}
        style={{ width: "100%" }}
        placeholder="Reference"
      />
      <div
        style={{
          fontSize: "0.85em",
          color: isError ? "red" : "#888",
          minHeight: 18,
          marginTop: 4,
          marginLeft: 10,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export default GroupSelector;
