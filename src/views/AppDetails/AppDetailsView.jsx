import { EllipsisOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Dropdown,
  Form,
  Image,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import * as R from "ramda";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AddSiteModal from "../../modal/AddSite";
import DeleteApp from "../../modal/DeleteProject";
import EditApp from "../../modal/EditApp";
import { exportSPAAS, selectGroup, updateCampus } from "../../services/features/AppsSlice";
import dayjs from "dayjs";
import logger from "@/logger";

const AppDetailsView = () => {
  const [formExportSpaas] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const data = useSelector((state) => state.apps.appDetails);
  const isAppSelected = useSelector((state) => state.apps.isAppSelected);
  const projectId = useSelector((state) => state.apps.selectedAppId);
  const { access, tenant, env } = useSelector((state) => state.auth);

  const [exportSpaasOpen, setExportSpaasOpen] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSelectSite = async (siteId) => {
    await dispatch(updateCampus(true));
    await dispatch(selectGroup(siteId));
    navigate("/siteDetails/" + siteId);
  };
  let canAccess = false;
  if (
    R.pathOr([], ["customers", "admin", tenant, env, "all"], access).includes(true) ||
    R.pathOr([], ["customers", "admin", tenant, env, "apps"], access)
      .flat()
      .includes(`${projectId}`)
  )
    canAccess = true;
  useEffect(() => {
    // unhautorized by keycloak
    if (!canAccess) navigate("/");
    // No app selected, force app selection screen
    if (!isAppSelected) navigate("/apps");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAppSelected, navigate]);

  /*   useEffect(() => {
    //fetching data of the application
    dispatch(loadAppDetails(appId));
  }, [dispatch, appId]); */

  const handleExportSPAAS = (values) => {
    logger.log("values", values);
    dispatch(
      exportSPAAS({
        siteId: values.siteId,
        startDate: values.range[0].toISOString(),
        endDate: values.range[1].toISOString(),
      }),
    )
      .then(() => {
        message.info("Votre export est en cours de création. Il va vous être envoyé par mail");
      })
      .catch(() => {
        message.error("Une erreur est survenue lors de l'export. Veuillez réessayer plus tard");
      });
  };

  const items = [
    {
      key: "1",
      label: <EditApp />,
    },
    {
      key: "2",
      label: <DeleteApp />,
    },
  ];
  if (!data) return null;
  return (
    <>
      <Row>
        <Col span={16} push={2}>
          <Button type="text" onClick={() => navigate(-1)} icon={<LeftOutlined />}>
            {t("app-details.back")}
          </Button>
        </Col>
      </Row>
      <Row>
        <Col span={16} push={2}>
          <Card bordered={false}>
            <Row>
              <Col span={22}>
                <Space direction="vertical" size={"middle"}>
                  {isError ? null : (
                    <Image src={data.iconURL} onError={() => setIsError(true)} width={120}></Image>
                  )}
                  <Typography.Title>{data.name}</Typography.Title>
                  <Typography.Text>
                    {t("app-details.project-id")}: {data.id}
                  </Typography.Text>
                </Space>
              </Col>
              <Col span={2}>
                <Dropdown disabled menu={{ items }} placement="bottomRight" arrow>
                  <Button disabled shape="circle" size="large" icon={<EllipsisOutlined />} />
                </Dropdown>
              </Col>
            </Row>
            <Divider />
            <Row>
              <Typography.Title level={3}>Sites</Typography.Title>
            </Row>
            <Row gutter={[10, 10]}>
              {canAccess ? (
                <Col>
                  <AddSiteModal data={data} />
                </Col>
              ) : null}
              {data.groups.map((site) =>
                site.prop1 === "campus" ? (
                  <Col key={site.id}>
                    <Button
                      onClick={() => handleSelectSite(site.id)}
                      type="dashed"
                      disabled={!canAccess ? true : false}
                      style={{ width: 200, height: 100, borderRadius: 12 }}
                    >
                      <Col span={2}>
                        <Row>
                          <Typography.Title level={5}>{site.label} </Typography.Title>{" "}
                        </Row>
                        <Row>ID: {site.id}</Row>
                      </Col>
                      <Col span={1} push={20}>
                        <RightOutlined />
                      </Col>
                    </Button>
                  </Col>
                ) : null,
              )}
            </Row>
            <Divider />
            {/* <Typography.Title level={5}>Dernier build</Typography.Title>
           <Space direction="horizontal" size="middle">
            <HistoryOutlined />
            {data[0].date}
          </Space>
          <Divider />
          <Typography.Title level={5}>Numéro de build</Typography.Title>
          <Space direction="vertical" size="middle">
            <Space direction="horizontal" size="middle">
              <InfoCircleFilled /> {data[0].version}
            </Space>
            <Space direction="horizontal" size="middle">
              <CalendarFilled /> {data[0].timeBuild}
            </Space>
            <Space direction="horizontal" size="middle">
              <RocketFilled /> {data[0].labelVersion}
            </Space> 
          </Space> */}
            <Typography.Title level={3}>Exports</Typography.Title>
            <Button type="primary" onClick={() => setExportSpaasOpen(true)}>
              Exporter les réservation SPAAS
            </Button>
          </Card>
        </Col>
      </Row>
      <Modal
        open={exportSpaasOpen}
        title="Exporter les réservation SPAAS"
        onCancel={() => setExportSpaasOpen(false)}
        footer={null}
      >
        <Form form={formExportSpaas} layout="vertical" onFinish={handleExportSPAAS}>
          <Form.Item name={["siteId"]} label="Site" rules={[{ required: true }]}>
            <Select
              style={{ width: "100%" }}
              options={data.groups
                .filter((site) => site.prop1 === "campus")
                .map((site) => ({ value: site.id, label: site.label }))}
            />
          </Form.Item>
          <Form.Item name={["range"]} label="Période" rules={[{ required: true }]}>
            <DatePicker.RangePicker style={{ width: "100%" }} />
          </Form.Item>
          <Typography.Paragraph>Raccourcis</Typography.Paragraph>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
            <Button
              size="middle"
              onClick={() =>
                formExportSpaas.setFieldValue(["range"], [dayjs().subtract(6, "month"), dayjs()])
              }
            >
              Les 6 derniers mois
            </Button>
            <Button
              size="middle"
              onClick={() =>
                formExportSpaas.setFieldValue(["range"], [dayjs().subtract(12, "month"), dayjs()])
              }
            >
              Les 12 derniers mois
            </Button>
            <Button
              size="middle"
              onClick={() =>
                formExportSpaas.setFieldValue(
                  ["range"],
                  [dayjs().startOf("month"), dayjs().endOf("month")],
                )
              }
            >
              Ce mois
            </Button>
            <Button
              size="middle"
              onClick={() =>
                formExportSpaas.setFieldValue(
                  ["range"],
                  [dayjs().startOf("year"), dayjs().endOf("year")],
                )
              }
            >
              Cette année
            </Button>
          </div>
          <Row gutter={[20]}>
            <Col span={12}>
              <Button block onClick={() => setExportSpaasOpen(false)}>
                Annuler
              </Button>
            </Col>
            <Col span={12}>
              <Button block type="primary" htmlType="submit">
                Exporter
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default AppDetailsView;
