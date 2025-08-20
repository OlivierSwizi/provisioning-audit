import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const TranslatedLabel = ({ label }) => {
  const [, i18n] = useTranslation();
  const lng = i18n.language.split("-")[0];

  const _label = useMemo(() => {
    return label[lng] || label["en"] || Object.values(label).filter(Boolean)[0] || "";
  }, [label, lng]);

  return _label;
};

export default TranslatedLabel;
