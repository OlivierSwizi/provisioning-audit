import { useTranslation } from "react-i18next";
import {
  Button,
  message,
  Form,
  Typography,
  Select,
  Flex,
  Card,
  InputNumber,
} from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import SiteSelector from "@/components/SiteSelector";

import { startWorking, stopWorking } from "@/services/features/UISlice";
import { useForm } from "antd/lib/form/Form";

import logger from "@/logger";

import JSONEditor from "@monaco-editor/react";
import MultilangNotificationEditor from "@/components/template-editors/MultilangNotificationEditor";

const WifiGuest = () => {
  const [form] = useForm();

  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const dispatch = useDispatch();

  const [siteId, setSiteId] = useState(null);
  const [wifiType, setWifiType] = useState("NONE");

  const WIFI_TYPES_OPTIONS = [
    { label: t("features-wifiguest.wifi-type-none"), value: "NONE" },
    { label: t("features-wifiguest.wifi-type-fake"), value: "FAKE" },
    { label: t("features-wifiguest.wifi-type-cisco"), value: "CISCO" },
  ];

  const loadConfig = async () => {
    let config;
    try {
      await dispatch(startWorking());
      config = await api.wifiGuest.getConfig(siteId);
      config.wifiType = config.wifiType || "NONE";
      form.setFieldsValue({
        wifiType: config.wifiType,
        providerConfig: JSON.stringify(config.providerConfig || {}, null, 2),
        notifyBeforeMinutes: config.notifyBeforeMinutes || 15,
        notificationTemplate: config.notificationTemplate || "",
      });
      setWifiType(config.wifiType);
    } catch (e) {
      logger.error(e);
      message.error(t("audience.load-error"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  useEffect(() => {
    if (!appId || !siteId) return;

    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, siteId]);

  const handleSave = async () => {
    try {
      await dispatch(startWorking());

      let data = form.getFieldsValue();
      data.providerConfig = JSON.parse(data.providerConfig || "{}");
      if (data.wifiType === "NONE") {
        data = {};
      }

      await api.wifiGuest.updateConfig(siteId, data);

      message.success(t("features-app.save-success"));
    } catch (error) {
      logger.log(error);
      message.error(t("features-app.save-error"));
    } finally {
      await dispatch(stopWorking());
    }

    loadConfig();
  };

  const onFieldsChange = (changedFields) => {
    const { wifiType } = form.getFieldsValue();
    if (changedFields.some((field) => field.name[0] === "wifiType")) {
      setWifiType(wifiType);
    }
  };

  return (
    <Flex style={{ marginTop: 20 }} vertical>
      <Typography.Title level={2}>{t("features-wifiguest.wifi-guest")}</Typography.Title>
      <Flex style={{ width: "100%" }} vertical>
        <SiteSelector
          value={siteId}
          onChange={setSiteId}
          size="medium"
          style={{ width: "250px", marginBottom: "25px" }}
          allowClear={false}
        />
        <Form form={form} onFinish={handleSave} layout="vertical" onFieldsChange={onFieldsChange}>
          <Card
            title={""}
            extra={
              <Button type="primary" style={{ width: "150px" }} htmlType="submit">
                {t("components.save")}
              </Button>
            }
            style={{
              width: "100%",
            }}
            bordered={false}
          >
            <Form.Item label={t("features-wifiguest.wifi-type")} name="wifiType" rules={[{ required: true }]}>
              <Select options={WIFI_TYPES_OPTIONS} />
            </Form.Item>

            {wifiType !== "NONE" && (
              <span style={{ marginTop: 100, marginBottom: 10 }}>
                <Typography.Text type="secondary">
                  {t(`wifi-${wifiType}-description`)}
                </Typography.Text>
              </span>
            )}
            <Form.Item
              label={t("features-wifiguest.notify-before-minutes")}
              name="notifyBeforeMinutes"
              rules={[{ required: true }]}
              style={{ marginTop: 10 }}
            >
              <InputNumber />
            </Form.Item>
            <Form.Item
              label={t("features-wifiguest.notification-template")}
              name="notificationTemplate"
              rules={[{ required: true }]}
              style={{ marginTop: 10 }}
            >
              <MultilangNotificationEditor
                keywords={["appName", "siteName", "ssid", "passphrase"]}
              />
            </Form.Item>

            <Form.Item
              label={t("features-wifiguest.provider-config")}
              name="providerConfig"
              rules={[{ required: true }]}
              hidden={["NONE", "FAKE"].includes(wifiType)}
              style={{ marginTop: 10 }}
            >
              <JSONEditor height={"400px"} />
            </Form.Item>
          </Card>
        </Form>
      </Flex>
    </Flex>
  );
};

export default WifiGuest;
