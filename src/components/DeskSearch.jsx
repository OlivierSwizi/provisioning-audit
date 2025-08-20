import { Select, Dropdown, Button, message } from "antd";
import { TagOutlined, NumberOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "@/services/features/AuthSlice";
import { useDebounce } from "use-debounce";
import logger from "@/logger";
import { useTranslation } from "react-i18next";

const DeskSearch = ({ value, onChange, disabled = false, siteId, size = "large" }) => {
  const [options, setOptions] = useState([]);
  const api = useSelector(API);

  const [searchDeskText, setSearchDeskText] = useState("");
  const [internalValue, setInternalValue] = useState();
  const [mode, setMode] = useState("label");

  const [debounceText] = useDebounce(searchDeskText, 500);

  const { t } = useTranslation();

  useEffect(() => {
    const doIt = async () => {
      if (debounceText) {
        try {
          const desks = await api.flexoffice.searchDesk(siteId, debounceText, mode);
          setOptions(
            (desks || [])
              .map((desk) => ({
                value: desk.uid,
                label: desk.title,
                uid: desk.uid,
                reference: desk.reference,
              }))
              .filter((u) => !!u.label),
          );
        } catch (err) {
          message.error(t("api-error"));
          logger.error(err);
        }
      } else setOptions([]);
    };

    doIt();
  }, [api, debounceText, mode, siteId]);

  const onSearch = (text) => {
    setSearchDeskText(text);
  };

  useEffect(() => {
    if (value) {
      setInternalValue({
        key: value.uid,
        uid: value.uid,
        title: value.label,
        reference: value.reference,
      });
    } else {
      setInternalValue();
    }
    setOptions([]);
  }, [value]);

  const onChangeInternal = (value) => {
    setInternalValue(value);
    const newDesk = options.find((u) => u.value === value.value);
    onChange({
      uid: newDesk.uid,
      title: newDesk.label,
      reference: newDesk.reference,
    });
  };

  const modeOptions = [
    {
      key: "label",
      label: (
        <>
          <TagOutlined /> Label
        </>
      ),
    },
    {
      key: "reference",
      label: (
        <>
          <NumberOutlined /> Reference
        </>
      ),
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      <Dropdown
        menu={{
          items: modeOptions.map((opt) => ({
            key: opt.key,
            label: opt.label,
            onClick: () => setMode(opt.key),
          })),
        }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <Button
          size="small"
          style={{
            position: "absolute",
            left: 0,
            top: 8,
            zIndex: 2,
            padding: 0,
            width: 24,
            height: 24,
            border: "none",
            background: "transparent",
          }}
          icon={mode === "label" ? <TagOutlined /> : <NumberOutlined />}
        />
      </Dropdown>
      <Select
        showSearch
        labelInValue
        defaultActiveFirstOption={false}
        filterOption={false}
        value={internalValue}
        onChange={onChangeInternal}
        onSearch={onSearch}
        size={size}
        notFoundContent={null}
        options={undefined}
        disabled={disabled}
        dropdownRender={(menu) => menu}
        optionLabelProp="label"
        style={{ width: "100%", paddingLeft: 32 }}
      >
        {options.map((option) => (
          <Select.Option key={option.value} value={option.value} label={option.label}>
            <div>
              <div>{mode === "label" ? option.label : option.reference}</div>
              <div style={{ fontSize: "0.85em", color: "#888" }}>
                {mode === "label" ? option.reference : option.label}
              </div>
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default DeskSearch;
