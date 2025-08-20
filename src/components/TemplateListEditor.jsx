import { Col, Row, Select, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import EmailTemplateEditor from "./template-editors/EmailTemplateEditor";

const TemplateListEditor = ({ value, onChange, keywords = {} }) => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const selectedEntryRef = useRef(selectedEntry);
  const valueRef = useRef(value);

  useEffect(() => {
    let lEntries = [];
    for (let entry in value || {}) {
      if (entry) lEntries.push({ key: entry, value: t(entry) });
    }
    setEntries(lEntries);

    valueRef.current = value;
    if (!selectedEntry) setSelectedEntry(lEntries[0]?.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    selectedEntryRef.current = selectedEntry;
  }, [selectedEntry]);

  const handleChange = (selected) => {
    setSelectedEntry(selected);
  };

  const handleChangeTemplate = (template) => {
    onChange({ ...valueRef.current, [selectedEntryRef.current]: template });
  };

  return (
    <Row style={{ width: "100%" }}>
      <Col span={24} style={{ marginBottom: "15px" }}>
        <Typography.Text>{t("template")}</Typography.Text>
      </Col>
      <Col span={12}>
        <Select onChange={handleChange} value={selectedEntry} size="middle">
          {(entries || []).map((entry) => (
            <Select.Option key={entry.key} value={entry.key}>
              {entry.value}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col span={24}>
        <EmailTemplateEditor
          value={value[selectedEntry]}
          onChange={handleChangeTemplate}
          keywords={keywords}
        />
      </Col>
    </Row>
  );
};

export default TemplateListEditor;
