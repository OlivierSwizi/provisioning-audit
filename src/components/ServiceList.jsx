import { Flex, Input, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const ServiceList = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [currentValue, setCurrentValue] = useState([]);

  useEffect(() => {
    setCurrentValue(value || []);
  }, [value]);

  return (
    <Flex vertical={true} gap={8}>
      {currentValue.map((service, index) => (
        <Flex key={index} gap={7} vertical={false} align="middle">
          <Input
            value={service.name}
            onChange={(v) => {
              currentValue[index].name = v.target.value;
              setCurrentValue([...currentValue]);
            }}
            style={{ width: 200 }}
            placeholder={t("services-name-placeholder")}
            onBlur={() => onChange(currentValue)}
          />
          <Input
            value={service.url}
            onChange={(v) => {
              currentValue[index].url = v.target.value;
              setCurrentValue([...currentValue]);
            }}
            style={{ width: 300 }}
            placeholder={t("services-url-placeholder")}
            onBlur={() => onChange(currentValue)}
          />
          <Tooltip title={t("remove-service")}>
            <a
              onClick={() => {
                currentValue.splice(index, 1);
                onChange(currentValue);
                setCurrentValue([...currentValue]);
              }}
            >
              {t("remove")}
            </a>
          </Tooltip>
        </Flex>
      ))}
      <a
        onClick={() => {
          currentValue.push({ name: "", url: "" });
          onChange(currentValue);
          setCurrentValue([...currentValue]);
        }}
      >
        {t("add")}
      </a>
    </Flex>
  );
};

export default ServiceList;
