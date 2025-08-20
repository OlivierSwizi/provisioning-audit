import ImageSwizi from "@/assets/images/logo_swizi_square.png";
import { SearchOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Input, Row, Typography } from "antd";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import NoApps from "./NoApps";
import { selectApp } from "../../services/features/AppsSlice";
import { useNavigate } from "react-router-dom";
import { useWorkDispatch } from "@/services/features/UISlice";

const AppList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workDispatch = useWorkDispatch();

  const [search, setSearch] = useState("");

  const appList = useSelector((state) => state.apps.appList);

  const filtered = appList.filter((d) => new RegExp(search, "i").test(d.name));

  const handleSelectApp = async (appId) => {
    await workDispatch(selectApp(appId));
    navigate(`/apps/${appId}`);
  };

  if (!appList.length) return <NoApps />;
  return (
    <Row style={{ width: "100%" }}>
      <Col flex={"auto"}>
        <Typography.Title style={{ textAlign: "left" }} level={3}>
          {t("apps-list.apps")}
        </Typography.Title>
      </Col>
      <Col span={8}>
        <Input
          onChange={(event) => setSearch(event.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: "100%" }}
          placeholder={t("apps-list.search-app")}
        />
      </Col>
      <Col span={24}>
        <section style={{ marginTop: "16px", padding: "10px 0" }}>
          <div
            style={{
              display: "grid",
              gridGap: "10px",
              gridTemplateColumns: "repeat(auto-fill, 380px)",
            }}
          >
            {filtered.map((item, idx) => (
              <Card
                hoverable
                bordered={false}
                key={idx}
                style={{ overflow: "hidden", minHeight: 96, align: "center" }}
                styles={{ body: { padding: "0", height: "100%" } }}
                onClick={() => handleSelectApp(item.id)}
              >
                <Flex align="center" gap={"1rem"} style={{ height: "100%" }}>
                  <img
                    style={{ width: 96 }}
                    alt=""
                    src={item.logoURL}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = ImageSwizi;
                    }}
                  />
                  <Flex vertical justify="center" gap={"0.5rem"}>
                    <Typography.Title style={{ margin: 0 }} level={5}>
                      {item.name}
                    </Typography.Title>
                    <Typography.Text copyable>#{item.id}</Typography.Text>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </div>
        </section>
      </Col>
    </Row>
  );
};

export default AppList;
