import { useWorkDispatch } from "@/services/features/UISlice";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Image,
  Modal,
  Row,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { exportSPAAS } from "../../services/features/AppsSlice";
import logger from "@/logger";
import { useSelectPublicMediaModal } from "@/components/modal/SelectPublicMediaModal";

const AppDetails = () => {
  const [formExportSpaas] = Form.useForm();
  const workDispatch = useWorkDispatch();
  const { t } = useTranslation();

  const selectedApp = useSelector((state) => state.apps.selectedApp);
  const { isUserGroupAdmin, siteList } = useSelector((state) => state.apps);

  const [exportSpaasOpen, setExportSpaasOpen] = useState(false);
  const [isError, setIsError] = useState(false);

  const [askSelect, SelectPublicMediaModal] = useSelectPublicMediaModal();

  const handleExportSPAAS = (values) => {
    logger.log("values", values);
    workDispatch(
      exportSPAAS({
        siteId: values.siteId,
        startDate: values.range[0].toISOString(),
        endDate: values.range[1].toISOString(),
      }),
    )
      .then(() => {
        message.success("Votre export est en cours de création. Il va vous être envoyé par mail");
      })
      .catch(() => {
        message.error("Une erreur est survenue lors de l'export. Veuillez réessayer plus tard");
      });
  };

  const handleOpenPublicMedia = () => {
    askSelect();
  };

  if (!selectedApp) return null;
  return (
    <div>
      {SelectPublicMediaModal}
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Card style={{ body: { padding: 0 } }} bordered={false}>
            {/* <PageHeader
              title={
                <Space>
                  <Glyph className={"secondary"} name={"dashboard"} />
                  <Typography.Text strong>{t("Général")}</Typography.Text>
                </Space>
              }
            >
              <Typography.Paragraph type="secondary"></Typography.Paragraph>
            </PageHeader> */}
          </Card>
        </Col>
        <Col span={24}>
          <Card bordered={false}>
            <Space direction="vertical" size={"middle"}>
              {isError ? null : (
                <Image
                  src={selectedApp.iconURL}
                  onError={() => setIsError(true)}
                  width={120}
                ></Image>
              )}
              <Typography.Title level={1} style={{ margin: 0 }}>
                {selectedApp.name}
              </Typography.Title>
              <Typography.Text>
                {t("app-details.project-id")}: {selectedApp.id}
              </Typography.Text>
            </Space>

            <Divider />

            <Typography.Title level={3}>Sites</Typography.Title>
            <Row gutter={[10, 10]}>
              {
                // je garde data.groups le temps que tous les backs soient à jour. c'est à retirer après. (27/01)
              }
              {siteList.map((site) => (
                <Col key={site.id}>
                  <Card bordered={true} style={{ width: 200 }}>
                    <Typography.Title level={5} ellipsis={{ tooltip: site.label }}>
                      {site.label}
                    </Typography.Title>
                    <Typography.Text>ID: {site.id}</Typography.Text>
                  </Card>
                </Col>
              ))}
            </Row>

            <Divider />

            <Typography.Title level={3}>{t("app-details.public-media-management")}</Typography.Title>
            <Button type="primary" onClick={handleOpenPublicMedia}>
              {t("app-details.got-to-public-media-lib")}
            </Button>

            <Divider />

            <Typography.Title level={3}>Exports</Typography.Title>
            <Button type="primary" onClick={() => setExportSpaasOpen(true)}>
              Exporter les réservations SPAAS
            </Button>
          </Card>
        </Col>
      </Row>
      <Modal
        open={exportSpaasOpen}
        title="Exporter les réservations SPAAS"
        onCancel={() => setExportSpaasOpen(false)}
        footer={null}
      >
        <Form form={formExportSpaas} layout="vertical" onFinish={handleExportSPAAS}>
          <Form.Item name={["siteId"]} label="Site" rules={[{ required: true }]}>
            {
              // je garde data.groups le temps que tous les backs soient à jour. c'est à retirer après. (27/01)
            }
            <Select
              style={{ width: "100%" }}
              options={siteList
                .map((site) => ({ value: site.id, label: site.label }))
                .filter((site) => {
                  return isUserGroupAdmin || siteList.find((s) => s.id === site.value);
                })}
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
    </div>
  );
};

export default AppDetails;
