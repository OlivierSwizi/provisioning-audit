import { Card, Col, Row, Typography } from "antd";
import { useTranslation } from "react-i18next";
import logo from "../../assets/images/logo_swizi.png";

const NoApps = () => {
  const { t } = useTranslation();

  const websites = [
    { title: "DBRM", url: import.meta.env.REACT_APP_DBRM_URL, description: t("apps-list.dbrm-explanations") },
    {
      title: "Monitor",
      url: import.meta.env.REACT_APP_MONITOR_URL,
      description: t("apps-list.monitor-explanations"),
    },
    {
      title: "Simulator",
      url: import.meta.env.REACT_APP_SIMULATOR_URL,
      description: t("apps-list.simulator-explanations"),
    },
    {
      title: "Ticketing",
      url: import.meta.env.REACT_APP_TICKETING_URL,
      description: t("apps-list.ticketing-explanations"),
    },

    // Add more websites here
  ];

  return (
    <div style={{ background: "#ECECEC", padding: "30px" }}>
      <div style={{ textAlign: "center" }}>
        <img src={logo} alt="logo" style={{ width: "250px" }} />
      </div>
      <Typography.Title level={3}>{t("apps-list.no-admin-access")}</Typography.Title>
      <Typography.Paragraph>{t("apps-list.other-tools-link")}</Typography.Paragraph>
      <Row gutter={16} style={{ marginTop: "32px" }}>
        {websites.map((website, index) => (
          <Col span={8} key={index} style={{ marginBottom: "16px" }}>
            <Card
              hoverable
              style={{ width: 240 }}
              cover={<></>}
              actions={[
                <a key="url" href={website.url} target="_blank" rel="noopener noreferrer">
                  {t("apps-list.visit")}
                </a>,
              ]}
              bordered={false}
            >
              <Card.Meta
                title={website.title}
                description={
                  <>
                    <p style={{ color: "#000000" }}>{website.url}</p>
                    <p>{website.description}</p>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default NoApps;
