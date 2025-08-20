import config from "@/config";
import { Col, Input, Row, Tabs, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import KeywordPanel from "./KeywordPanel";

const NotificationEditor = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(value.title);
  const [body, setBody] = useState(value.body);

  useEffect(() => {
    setTitle(value.title);
    setBody(value.body);
  }, [value]);

  return (
    <Row style={{ width: "100%" }}>
      <Col span={24}>
        <Typography.Text>{t("components.notification-template-title")}</Typography.Text>
      </Col>
      <Col span={24} style={{ maxWidth: "550px" }}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => onChange({ title, body })}
        />
      </Col>
      <Col span={24} style={{ marginTop: "15px" }}>
        <Typography.Text>{t("components.notification-template-body")}</Typography.Text>
      </Col>
      <Col span={24} style={{ maxWidth: "550px" }}>
        <Input.TextArea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={() => onChange({ title, body })}
        />
      </Col>
    </Row>
  );
};

const TemplateNotifEditor = ({ value, onChange, keywords = [], prefix = "", keywordHelp = "" }) => {
  const languages = config.languages.map((lng) => ({
    key: lng,
    label: lng.toUpperCase(),
    children: (
      <NotificationEditor
        value={{
          title: value.title[lng] || "",
          body: value.body[lng] || "",
        }}
        onChange={(v) =>
          onChange({
            ...value,
            title: { ...value.title, [lng]: v.title },
            body: { ...value.body, [lng]: v.body },
          })
        }
      />
    ),
  }));
  return (
    <Row style={{ width: "100%" }}>
      <Col span={24}>
        <KeywordPanel
          keywords={keywords}
          prefix={prefix}
          keywordHelp={keywordHelp}
          style={{ marginTop: "10px", marginBottom: "10px" }}
        />
      </Col>
      <Col span={24}>
        <Tabs type="card" items={languages} style={{ width: "100%" }} />
      </Col>
    </Row>
  );
};

export default TemplateNotifEditor;
