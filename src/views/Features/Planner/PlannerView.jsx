import { useTranslation } from "react-i18next";
import { Row, Col, Typography, message, Button, Form, Card, Tabs, Select, Checkbox } from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import { startWorking, stopWorking } from "@/services/features/UISlice";
import MultiLineFormItem from "@/components/MultiLineFormItem";
import GroupSelector from "@/components/GroupSelector";
import ReadOnlyComponent from "@/components/ReadOnlyComponent";
import Input from "antd/lib/input/Input";
import DomainList from "@/components/DomainList";
import logger from "@/logger";

const { Title, Text } = Typography;

const PlannerView = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const [form] = Form.useForm();

  const [selectedO365Provider, setSelectedO365Provider] = useState();
  const [isConfigured, setIsConfigured] = useState(false);
  const [swiziIsActivated, setSwiziIsActivated] = useState(false);
  const [swiziAsDefault, setSwiziAsDefault] = useState(false);
  const [disableRemoveOnCancel, setDisableRemoveOnCancel] = useState(false);

  const loadSettings = async () => {
    try {
      await dispatch(startWorking());
      const config = await api.planner.getConfig();
      if (!config) {
        setIsConfigured(false);
        return;
      } else {
        setIsConfigured(true);
      }
      if (config?.providers?.O365) {
        if (!Array.isArray(config.providers.O365)) {
          config.providers.O365 = [config.providers.O365];
        }
        setSelectedO365Provider(0);
      } else setSelectedO365Provider(null);

      config.removeOnCancel = config.removeOnCancel ? "true" : "false";

      config.activateSwizi = !!config?.providers?.SWIZI;
      setSwiziIsActivated(config.activateSwizi);
      config.swiziAsDefault = !!config?.providers?.SWIZI?.useAsDefaultProvider;
      setSwiziAsDefault(config.swiziAsDefault);
      config.swiziDomains = config?.providers?.SWIZI?.domains || [];

      if (
        config.providers.O365 &&
        (config.providers.O365.length > 1 ||
          (config.providers.O365[0].length && config.activateSwizi))
      ) {
        config.removeOnCancel = true;
        config.removeOnCancel = config.removeOnCancel ? "true" : "false";
        setDisableRemoveOnCancel(true);
      }

      if (config.providers.O365 && config.providers.O365.length > 1) {
        config.providers.O365.forEach((provider, idx) => {
          if (!provider.name) provider.name = `Provider ${idx + 1}`;
        });
      }

      form.setFieldsValue(config);
    } catch (error) {
      logger.error(error);
      message.error(t("error-load-scim-settings"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  const saveSettings = async () => {
    try {
      await dispatch(startWorking());
      const data = form.getFieldsValue([
        "providers",
        "VIPGroups",
        "removeOnCancel",
        "swiziAsDefault",
        "swiziDomains",
        "activateSwizi",
      ]);
      data.removeOnCancel = data.removeOnCancel === "true";
      if (data.activateSwizi)
        data.providers.SWIZI = {
          useAsDefaultProvider: data.swiziAsDefault,
          domains: data.swiziDomains,
        };
      else delete data.providers.SWIZI;

      delete data.activateSwizi;
      delete data.swiziAsDefault;
      delete data.swiziDomains;

      await api.planner.saveConfig(data);
    } catch (error) {
      logger.error(error);
      message.error(t("error-scim-save-settings"));
    } finally {
      await dispatch(stopWorking());
    }
    loadSettings();
  };

  const handleAddO365Provider = () => {
    const providers = form.getFieldValue(["providers"]);
    if (!providers.O365) providers.O365 = [];
    providers.O365 = [
      ...providers.O365,
      {
        name: `Provider ${providers.O365.length + 1}`,
        tenantId: "",
        appId: "",
        appPassword: "",
        domains: [],
        genericUser: "",
      },
    ];

    form.setFieldsValue({
      providers,
    });

    setSelectedO365Provider(providers.O365.length - 1);
  };

  const handleCleanCache = async (type) => {
    try {
      await dispatch(startWorking());
      await api.planner.cleanCache(type);
      message.info(t("cache-cleaned"));
    } catch (error) {
      logger.error(error);
      message.error(t("error-clean-cache"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  const handleRenewSubscriptions = async () => {
    try {
      await dispatch(startWorking());
      await api.planner.renewSubscriptions();
      message.info(t("subscriptions-renewed"));
    } catch (error) {
      logger.error(error);
      message.error(t("error-renew-subscriptions"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  useEffect(() => {
    if (appId) loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const configurePlanner = async () => {
    try {
      await dispatch(startWorking());
      await api.planner.configure();
    } catch (error) {
      logger.error(error);
      message.error(t("error-configure-planner"));
    } finally {
      await dispatch(stopWorking());
    }
    loadSettings();
  };

  const O365Provider = () => {
    if (!form.getFieldValue(["providers", "O365"]))
      return (
        <Row style={{ width: "100%" }}>
          <Col
            span={24}
            style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}
          >
            <Text>{t("no-O365-provider-configured")}</Text>
          </Col>
          <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
            <Button type="primary" onClick={handleAddO365Provider}>
              {t("add-O365-provider")}
            </Button>
          </Col>
        </Row>
      );

    return (
      <>
        <Row style={{ width: "100%" }}>
          <Col span={5} style={{ marginBottom: 10 }}>
            <Select value={selectedO365Provider} onChange={(v) => setSelectedO365Provider(v)}>
              {form.getFieldValue(["providers", "O365"]).map((provider, index) => (
                <Select.Option key={index} value={index}>
                  {provider.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={5} offset={14} style={{ display: "flex", justifyContent: "center" }}>
            <Button onClick={handleAddO365Provider}>{t("add-O365-provider")}</Button>
          </Col>
        </Row>
        <MultiLineFormItem
          label={t("O365-tenant-name")}
          name={["providers", "O365", selectedO365Provider, "name"]}
        >
          <Input autoComplete="off" />
        </MultiLineFormItem>
        <MultiLineFormItem
          label={t("O365-tenantId")}
          name={["providers", "O365", selectedO365Provider, "tenantId"]}
        >
          <Input autoComplete="off" />
        </MultiLineFormItem>
        <MultiLineFormItem
          label={t("O365-clientId")}
          name={["providers", "O365", selectedO365Provider, "appId"]}
        >
          <Input autoComplete="off" />
        </MultiLineFormItem>
        <MultiLineFormItem
          label={t("O365-secret")}
          name={["providers", "O365", selectedO365Provider, "appPassword"]}
        >
          <Input autoComplete="off" />
        </MultiLineFormItem>
        <MultiLineFormItem
          label={t("O365-domains")}
          name={["providers", "O365", selectedO365Provider, "domains"]}
        >
          <DomainList />
        </MultiLineFormItem>
        <MultiLineFormItem
          label={t("allow-outside-tenant-booking")}
          name={["providers", "O365", selectedO365Provider, "allowOutsideTenantBooking"]}
          valuePropName="checked"
        >
          <Checkbox />
        </MultiLineFormItem>
        {/* <MultiLineFormItem
        label={t("O365-serviceUser")}
        name={["providers", "O365", selectedO365Provider, "genericUser"]}
        rules={[
          {
            validator: (_, value) => {
              if (!value || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(t("invalid-blank-or-email")));
            },
          },
        ]}
      >
        <Input autoComplete="off"/>
      </MultiLineFormItem> */}
      </>
    );
  };

  const SwiziProvider = () => {
    return (
      <>
        <MultiLineFormItem
          label={t("activate-swizi-provider")}
          name={"activateSwizi"}
          valuePropName="checked"
        >
          <Checkbox />
        </MultiLineFormItem>
        {swiziIsActivated && (
          <>
            <MultiLineFormItem
              label={t("use-swizi-provider-as-default")}
              name={["swiziAsDefault"]}
              valuePropName="checked"
            >
              <Checkbox />
            </MultiLineFormItem>
            {!swiziAsDefault && (
              <MultiLineFormItem label={t("swizi-domains")} name={["swiziDomains"]}>
                <DomainList />
              </MultiLineFormItem>
            )}
          </>
        )}
      </>
    );
  };

  const GoogleProvider = () => {
    return <Text>{t("not-available")}</Text>;
  };

  const providersTab = [
    {
      label: t("provider-O365"),
      key: "O365",
      children: <O365Provider />,
    },
    {
      label: t("provider-Swizi"),
      key: "Swizi",
      children: <SwiziProvider />,
    },
    {
      label: t("provider-google"),
      key: "Google",
      children: <GoogleProvider />,
    },
  ];

  if (!isConfigured) {
    return (
      <Row style={{ width: "100%" }}>
        <Col span={24} style={{ display: "flex", justifyContent: "center", marginBottom: "15px" }}>
          <Text>{t("planner-not-configured")}</Text>
        </Col>
        <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
          <Button
            type="primary"
            onClick={async () => {
              await configurePlanner();
            }}
          >
            {t("configure-planner")}
          </Button>
        </Col>
      </Row>
    );
  }

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Typography.Title level={2}>{t("planner")}</Typography.Title>
        </Col>

        <Col span={24}>
          <Card
            title={<Title level={4}>{t("planner-operations")}</Title>}
            style={{
              width: "100%",
              marginBottom: "15px",
            }}
            bordered={false}
          >
            <Row
              style={{
                width: "100%",
                marginBottom: "15px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Button onClick={() => handleCleanCache("rm")} style={{ width: "250px" }}>
                {t("clean-cache-RM")}
              </Button>

              <Button onClick={() => handleCleanCache("dwm")} style={{ width: "250px" }}>
                {t("clean-cache-users")}
              </Button>

              <Button onClick={() => handleCleanCache("o365")} style={{ width: "250px" }}>
                {t("clean-cache-o365")}
              </Button>

              <Button onClick={() => handleRenewSubscriptions()} style={{ width: "250px" }}>
                {t("renew-subscriptions")}
              </Button>
            </Row>
          </Card>
        </Col>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={24}>
              <Form
                form={form}
                onFinish={saveSettings}
                onValuesChange={(changedFields, allFields) => {
                  setSwiziIsActivated(allFields.activateSwizi);
                  setSwiziAsDefault(allFields.swiziAsDefault);
                }}
                labelCol={{
                  span: 5,
                }}
                wrapperCol={{
                  offset: 1,
                  span: 17,
                }}
                layout="horizontal"
              >
                <Card
                  title={<Title level={4}>{t("planner-config")}</Title>}
                  extra={
                    <Button type="primary" style={{ width: "150px" }} htmlType="submit">
                      {t("save")}
                    </Button>
                  }
                  style={{
                    width: "100%",
                  }}
                  bordered={false}
                >
                  <div style={{ overflowY: "auto" }}>
                    <Row style={{ width: "100%" }}>
                      <Col span={24}>
                        <Typography.Title level={5}>{t("notice")}</Typography.Title>
                        <Typography.Paragraph
                          style={{ whiteSpace: "pre-line" }}
                          ellipsis={{
                            rows: 1,
                            expandable: "collapsible",
                          }}
                        >
                          {t("planner-explanation")}
                        </Typography.Paragraph>
                      </Col>
                    </Row>
                    <MultiLineFormItem label={t("planner-id")} name="id">
                      <ReadOnlyComponent copyable>{form.getFieldValue("id")}</ReadOnlyComponent>
                    </MultiLineFormItem>
                    <MultiLineFormItem label={t("VIP-groups")} name="VIPGroups">
                      <GroupSelector mode="tags" size="middle" />
                    </MultiLineFormItem>
                    <MultiLineFormItem label={t("cancelation-mode")} name="removeOnCancel">
                      <Select disabled={disableRemoveOnCancel} size="middle">
                        <Select.Option value="true">{t("remove-on-cancel")}</Select.Option>
                        <Select.Option value="false">{t("release-on-cancel")}</Select.Option>
                      </Select>
                    </MultiLineFormItem>
                    <Row style={{ width: "100%" }}>
                      <Col span={24}>
                        <Typography.Title level={5}>{t("planner-providers")}</Typography.Title>
                      </Col>
                    </Row>
                    <Row style={{ width: "100%" }}>
                      <Col span={24}>
                        <Tabs items={providersTab} />
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default PlannerView;
