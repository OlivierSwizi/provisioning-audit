//
import Glyph from "@/common/Glyph";
import { LeftOutlined } from "@ant-design/icons";
import { Button, Card, Col, Layout, Row, Select, Space, Typography } from "antd";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import SwiziGroupCreation from "./creation/SwiziGroupCreation";
import AzureGroupCreation from "./creation/AzureGroupCreation";
import SiteGroupCreation from "./creation/SiteGroupCreation";
import CompositGroupCreation from "./creation/CompositGroupCreation";
import { useSelector } from "react-redux";

const { Text, Title } = Typography;

const GROUP_TYPES = [
  {
    key: "swizi",
    label: "Swizi",
  },
  {
    key: "azuread",
    label: "Azure AD",
  },
  {
    key: "composit",
    label: "Composite",
  },
];

const GroupCreation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isUserGroupAdmin = useSelector((state) => state.apps.isUserGroupAdmin);

  const [groupType, setGroupType] = useState("swizi");

  return (
    <Layout style={{ height: "100%", gap: 20 }}>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Button size="middle" type="text" onClick={() => navigate(-1)} icon={<LeftOutlined />}>
            {t("back")}
          </Button>
        </Col>
        <Col span={24}>
          <Card bordered={false}>
            <Space align="start" size={"large"}>
              <Glyph className={"secondary"} name={"groups"} style={{ fontSize: "2.3rem" }} />
              <Row style={{ width: "100%" }}>
                <Col span={24} style={{ display: "flex" }}>
                  <Title level={3} style={{ marginRight: "15px" }}>
                    {t("group-creation")}
                  </Title>
                </Col>
              </Row>
            </Space>

            {isUserGroupAdmin ? (
              <Row style={{ width: "100%" }}>
                <Col span={8}>
                  <Text>{t("group-type")}</Text>
                </Col>

                <Col span={8}>
                  <Select value={groupType} onSelect={(v) => setGroupType(v)}>
                    {GROUP_TYPES.map((item) => (
                      <Select.Option key={item.key} value={item.key}>
                        {item.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            ) : null}
          </Card>
        </Col>
      </Row>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          {groupType === "swizi" && <SwiziGroupCreation />}
          {groupType === "azuread" && <AzureGroupCreation />}
          {groupType === "site" && <SiteGroupCreation />}
          {groupType === "composit" && <CompositGroupCreation />}
        </Col>
      </Row>
    </Layout>
  );
};

export default GroupCreation;
