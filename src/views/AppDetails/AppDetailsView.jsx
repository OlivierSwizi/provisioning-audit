// FILENAME: src/views/AppDetails/AppDetailsView.jsx
import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  List,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  Avatar,
  message,
} from "antd";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

// externes absolus (conservés)
import { useWorkDispatch } from "@/services/features/UISlice";
import logger from "@/logger";
import { useSelectPublicMediaModal } from "@/components/modal/SelectPublicMediaModal";

// relatif (conservé tel quel)
import { exportSPAAS } from "../../services/features/AppsSlice";

const { Title, Text } = Typography;

function stringToColor(str) {
  if (!str) return "#dfe6ef";
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    // eslint-disable-next-line no-bitwise
    hash &= hash;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 46%, 78%)`;
}
function getInitials(name) {
  if (!name) return "S";
  const parts = String(name)
    .trim()
    .split(/\s|[-_/]+/u)
    .filter(Boolean);
  const letters =
    parts.length === 1
      ? parts[0].slice(0, 2)
      : parts
          .slice(0, 2)
          .map((p) => p[0])
          .join("");
  return letters.toUpperCase();
}

const AppDetails = () => {
  const [formExportSpaas] = Form.useForm();
  const workDispatch = useWorkDispatch();
  const { t } = useTranslation();

  // sélecteurs conservés
  const selectedApp = useSelector((state) => state.apps.selectedApp);
  const { isUserGroupAdmin, siteList } = useSelector((state) => state.apps);

  // état modales conservé
  const [exportSpaasOpen, setExportSpaasOpen] = useState(false);
  const [isError, setIsError] = useState(false);

  // hook modal bibliothèque publique (conservé tel quel)
  const [askSelect, SelectPublicMediaModal] = useSelectPublicMediaModal();

  const appName = selectedApp?.name ?? "";
  const appIdText = selectedApp?.id != null ? String(selectedApp.id) : "";
  const logoURL = selectedApp?.iconURL;

  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(logoURL) && !imgError;

  const sites = useMemo(() => selectedApp?.siteList || siteList || [], [selectedApp, siteList]);

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
        message.success("Votre export est en cours de création.\nIl va vous être envoyé par mail");
      })
      .catch(() => {
        message.error("Une erreur est survenue lors de l'export. Veuillez réessayer plus tard");
      });
  };

  if (!selectedApp) return null;

  return (
    <div style={{ width: "100%" }}>
      {/* Titre */}
      <Title level={3} style={{ marginTop: 0, marginBottom: 12 }}>
        {t("app-details.Général")}
      </Title>

      {/* En-tête / résumé */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}
        bodyStyle={{ padding: 16 }}
      >
        <Row align="middle" gutter={[16, 16]} wrap>
          <Col>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                background: "#fff",
                border: "1px solid #EDF0F5",
                boxShadow: "inset 0 0 0 6px #F5F7FA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
              aria-hidden
            >
              {showImage ? (
                <img
                  src={logoURL}
                  alt=""
                  onError={() => setImgError(true)}
                  style={{ width: "90%", height: "90%", objectFit: "contain" }}
                  loading="lazy"
                />
              ) : (
                <Avatar
                  shape="square"
                  size={64}
                  style={{
                    borderRadius: 12,
                    backgroundColor: stringToColor(appName),
                    color: "#1a2b3c",
                    fontWeight: 700,
                    fontSize: 20,
                    lineHeight: "64px",
                  }}
                >
                  {getInitials(appName)}
                </Avatar>
              )}
            </div>
          </Col>

          <Col flex="auto" style={{ minWidth: 0 }}>
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <Tooltip title={appName}>
                <Title level={4} style={{ margin: 0 }} ellipsis={{ rows: 1 }}>
                  {appName}
                </Title>
              </Tooltip>

              {appIdText ? (
                <Text
                  type="secondary"
                  style={{ fontSize: 13 }}
                  copyable={{ text: appIdText }}
                  ellipsis
                >
                  #{appIdText}
                </Text>
              ) : null}
            </Space>
          </Col>

          <Col>
            <Space size={8} wrap>
              <Button onClick={() => askSelect()}>
                {t("app-details.public-media-management")}
              </Button>

              <Button type="default" onClick={() => setExportSpaasOpen(true)}>
                {t("app-details.export-spaas")}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Espace visuel */}
      <div style={{ height: 16 }} />

      {/* Liste des sites */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}
        bodyStyle={{ padding: 12 }}
      >
        <Row align="middle" justify="space-between" style={{ marginBottom: 8 }}>
          <Col>
            <Title level={5} style={{ margin: 0 }}>
              {t("components.site")}
            </Title>
          </Col>
          <Col>
            <Text type="secondary">
              {t("apps-list.sites-count")}{" "}
              <Text strong>{Array.isArray(sites) ? sites.length : 0}</Text>
            </Text>
          </Col>
        </Row>

        <Divider style={{ margin: "8px 0 12px" }} />

        <List
          dataSource={sites}
          locale={{ emptyText: t("apps-list.empty") }}
          renderItem={(site) => {
            const name = site?.label ?? "";
            const idText = site?.id != null ? String(site.id) : "";
            return (
              <List.Item
                key={idText || name}
                style={{ padding: "10px 8px", borderRadius: 8, marginBottom: 6 }}
              >
                <List.Item.Meta
                  title={
                    <Tooltip title={name}>
                      <Text strong ellipsis>
                        {name}
                      </Text>
                    </Tooltip>
                  }
                  description={
                    idText ? (
                      <Text type="secondary" style={{ fontSize: 12 }} copyable={{ text: idText }}>
                        #{idText}
                      </Text>
                    ) : null
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      {/* Modale de sélection médias publics (conservée telle quelle) */}
      {SelectPublicMediaModal}

      {/* Modale Export SpaaS (conservée, ergonomie revisitée) */}
      <Modal
        open={exportSpaasOpen}
        onCancel={() => setExportSpaasOpen(false)}
        footer={null}
        title={t("common.export")}
        destroyOnClose
      >
        <Form form={formExportSpaas} layout="vertical" onFinish={handleExportSPAAS}>
          <Form.Item
            name="siteId"
            label={t("components.site")}
            rules={[{ required: true }]}
            style={{ marginBottom: 12 }}
          >
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={t("components.choose-address")}
              options={sites
                .map((site) => ({ value: site.id, label: site.label }))
                .filter((opt) => {
                  return isUserGroupAdmin || sites.find((s) => s.id === opt.value);
                })}
            />
          </Form.Item>

          <Form.Item
            name="range"
            label={t("audience.period")}
            rules={[{ required: true }]}
            style={{ marginBottom: 8 }}
          >
            <DatePicker.RangePicker
              style={{ width: "100%" }}
              allowClear
              format="DD/MM/YYYY"
              disabledDate={(d) => d && d > dayjs()}
            />
          </Form.Item>

          <Space size={8} wrap style={{ marginBottom: 12 }}>
            <Button
              onClick={() =>
                formExportSpaas.setFieldValue(["range"], [dayjs().subtract(6, "month"), dayjs()])
              }
            >
              {t("common.months.last6")}
            </Button>
            <Button
              onClick={() =>
                formExportSpaas.setFieldValue(["range"], [dayjs().subtract(12, "month"), dayjs()])
              }
            >
              {t("common.months.last12")}
            </Button>
            <Button
              onClick={() =>
                formExportSpaas.setFieldValue(
                  ["range"],
                  [dayjs().startOf("month"), dayjs().endOf("month")],
                )
              }
            >
              {t("common.months.this")}
            </Button>
            <Button
              onClick={() =>
                formExportSpaas.setFieldValue(
                  ["range"],
                  [dayjs().startOf("year"), dayjs().endOf("year")],
                )
              }
            >
              {t("common.years.this")}
            </Button>
          </Space>

          <Divider style={{ margin: "8px 0 12px" }} />

          <Space style={{ display: "flex", justifyContent: "flex-end" }} size={8}>
            <Button onClick={() => setExportSpaasOpen(false)}>{t("common.cancel")}</Button>
            <Button type="primary" htmlType="submit">
              {t("common.export")}
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default AppDetails;
