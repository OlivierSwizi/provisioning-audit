import { Col, Input, Row, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import HTMLEditor from "./HTMLEditor";
import KeywordPanel from "./KeywordPanel";

const EmailTemplateEditor = ({ value, onChange, keywords }) => {
  const { t } = useTranslation();

  const [currentSubject, setCurrentSubject] = useState("");
  const [currentContent, setCurrentContent] = useState("");

  const subjectRef = useRef();
  const contentRef = useRef();

  useEffect(() => {
    if (value) {
      setCurrentSubject(value.subject);
      setCurrentContent(value.content);
    }
  }, [value]);

  useEffect(() => {
    subjectRef.current = currentSubject;
  }, [currentSubject]);

  useEffect(() => {
    contentRef.current = currentContent;
  }, [currentContent]);

  const handleUpdate = () => {
    if (onChange) onChange({ subject: subjectRef.current, content: contentRef.current });
  };

  return (
    <Row style={{ width: "100%" }}>
      <Col span={24}>
        <KeywordPanel keywords={keywords} />
      </Col>
      <Col span={24}>
        <Typography.Text>{t("components.mail-subject")}</Typography.Text>
      </Col>
      <Col span={24} style={{ marginBottom: "15px", marginTop: "15px" }}>
        <Input
          value={currentSubject}
          onChange={(e) => setCurrentSubject(e.target.value)}
          onBlur={handleUpdate}
        />
      </Col>
      <Col span={24} style={{ marginBottom: "15px" }}>
        <Typography.Text>{t("components.mail-body")}</Typography.Text>
      </Col>
      <Col span={24} style={{ border: "2px solid #d9d9d9" }}>
        <HTMLEditor
          value={currentContent}
          onChange={(v) => {
            setCurrentContent(v);
          }}
          onBlur={handleUpdate}
        />
      </Col>
    </Row>
  );
};

export default EmailTemplateEditor;
