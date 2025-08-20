import Glyph from "@/common/Glyph";
import { Col, Flex, Row, Tabs, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import FormsArchived from "./FormsArchived";
import FormsRunning from "./FormsRunning";
import { useEffect } from "react";
import { useWorkDispatch } from "@/services/features/UISlice";
import { listForms } from "@/services/features/FormSlice";

const Forms = () => {
  const [t] = useTranslation();
  const workDispatch = useWorkDispatch();

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    workDispatch(listForms());
  }, [workDispatch]);

  const tabs = [
    {
      key: "running",
      label: t("forms.running"),
      children: <FormsRunning />,
    },
    {
      key: "finished",
      label: t("forms.finished"),
      children: <FormsArchived />,
    },
  ];

  return (
    <Row gutter={[20, 20]}>
      <Col span={24}>
        <Flex align="center" gap={"0.5rem"}>
          <Glyph name={"mood"} style={{ color: "var(--secondary_base)", fontSize: "1.8rem" }} />
          <Typography.Title style={{ margin: 0 }} level={2}>
            {t("forms")}
          </Typography.Title>
        </Flex>
      </Col>
      <Col span={24}>
        <Tabs
          items={tabs}
          activeKey={searchParams.get("key") || "running"}
          onChange={(key) => setSearchParams((p) => ({ ...p, key }), { replace: true })}
        />
      </Col>
    </Row>
  );
};

export default Forms;
