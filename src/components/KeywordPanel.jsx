import { Col, Collapse, Row, Typography } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const KeywordPanel = ({ keywords, prefix = "", keywordHelp = "", style = {} }) => {
  const { t } = useTranslation();
  const [keys, setKeys] = useState([]);

  useEffect(() => {
    if (!keywords || !t) return setKeys([]);
    const keys = [];
    for (const key of keywords) {
      keys.push({ key, value: t(prefix + key) });
    }

    setKeys(keys);
  }, [keywords, t]);

  return (
    <Row style={{ width: "100%", ...style }}>
      <Col span={24}>
        <Collapse>
          <Collapse.Panel header={t("keyword-title")} key="1">
            <Row style={{ width: "100%" }}>
              {keywordHelp && (
                <Col span={24} style={{ marginBottom: "15px" }}>
                  <Typography.Text>{t(keywordHelp)}</Typography.Text>
                </Col>
              )}
              {keys.map((entry) => (
                <Col span={12} key={entry.key}>
                  <Row>
                    <Col span={5}>
                      <Typography.Text strong copyable>
                        {`{{${entry.key}}}`}
                      </Typography.Text>
                    </Col>
                    <Col offset={1} span={12}>
                      {entry.value}
                    </Col>
                  </Row>
                </Col>
              ))}
            </Row>
          </Collapse.Panel>
        </Collapse>
      </Col>
    </Row>
  );
};

export default KeywordPanel;
