import * as R from "ramda";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import {
  Row,
  Col,
  Typography,
  message,
  Button,
  Form,
  Card,
  Tabs,
  Select,
  Checkbox,
  Flex,
  Popconfirm,
  Table,
  Tooltip,
  Divider,
} from "antd";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import { startWorking, stopWorking } from "@/services/features/UISlice";
import MultiLineFormItem from "@/components/MultiLineFormItem";
import { useDebounce } from "use-debounce";

import Input from "antd/lib/input/Input";
import DomainList from "@/components/DomainList";
import logger from "@/logger";
import { useForm } from "antd/es/form/Form";
import { CheckOutlined, CloseOutlined, DeleteOutlined, SyncOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const PROVIDER_TYPES = [
  {
    key: "O365",
    value: "O365",
  },
];

const CMView = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const api = useSelector(API);

  const useCM = useSelector((state) => state.apps.selectedApp?.useCM);
  const appId = useSelector((state) => state.apps.selectedApp.id);

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerList, setProviderList] = useState([]);
  const [typeCanBeChanged, setTypeCanBeChanged] = useState(false);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [locationStatus, setLocationStatus] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [locationsAreLoading, setLocationsAreLoading] = useState(false);
  const [onlyErrors, setOnlyErrors] = useState(false);

  const [debouncedFilter] = useDebounce(filter, 500);

  const [form] = useForm();

  const providerIdToPreserve = useRef(null);

  const loadProviders = useCallback(async () => {
    if (appId && useCM) {
      try {
        const providers = await api.cm.getProviders();
        providers.sort((a, b) => {
          // Sort by type: SWIZI should come last
          if (a.type === "SWIZI" && b.type !== "SWIZI") return 1;
          if (a.type !== "SWIZI" && b.type === "SWIZI") return -1;

          // If types are the same, sort by name alphabetically
          return a.name.localeCompare(b.name);
        });
        setProviderList(providers);
        let provider;
        if (providers.length > 0) {
          if (providerIdToPreserve.current) {
            provider = providers.find((p) => p.id === providerIdToPreserve.current);
            providerIdToPreserve.current = null;
          }
          if (!provider) provider = providers[0];
          setSelectedProvider(provider);
          providerIdToPreserve.current = provider.id;
        } else {
          setSelectedProvider(null);
        }
      } catch (error) {
        logger.error("Failed to load CM providers", error);
        message.error(t("features-cm.cm_provider_load_error"));
      }
    }
  }, [appId, useCM, api.cm, t]);

  const loadLocationStatus = useCallback(async () => {
    if (selectedProvider)
      try {
        setLocationsAreLoading(true);
        const data = await api.cm.listLocationStatus(selectedProvider.id, {
          filter: debouncedFilter,
          page,
          pageSize,
          onlyErrors,
        });
        setLocationStatus(data.items);
        setPage(data.page);
        setPageSize(data.pageSize);
        setTotal(data.total);
      } catch (error) {
        setLocationStatus([]);
        setPage(1);
        setPageSize(10);
        setTotal(0);
        logger.error("Failed to load location status", error);
        message.error(t("features-cm.cm_location_status_load_error"));
      } finally {
        setLocationsAreLoading(false);
      }
  }, [api, t, page, pageSize, selectedProvider, debouncedFilter, onlyErrors]);

  useEffect(() => {
    loadProviders();
  }, [appId, useCM, api, loadProviders]);

  useEffect(() => {
    if (selectedProvider) {
      selectedProvider.domains = selectedProvider.domains || [];
      if (selectedProvider.type === "O365") {
        selectedProvider.providerConfig = selectedProvider.providerConfig || {};
        selectedProvider.providerConfig.tenantId = selectedProvider.providerConfig.tenantId || "";
        selectedProvider.providerConfig.clientId = selectedProvider.providerConfig.clientId || "";
        selectedProvider.providerConfig.secret = selectedProvider.providerConfig.secret || "";
        selectedProvider.providerConfig.delegatedTokenMode =
          !selectedProvider.providerConfig.applicationServiceTokenMode;
      }

      form.setFieldsValue(selectedProvider);
      setTypeCanBeChanged(!selectedProvider.alreadyExists);
      loadLocationStatus();
    }
  }, [form, loadLocationStatus, selectedProvider]);

  useEffect(() => {
    if (selectedProvider) {
      loadLocationStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    setRefresh(!refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, selectedProvider?.id]);

  useEffect(() => {
    setPage(1);
    setPageSize(10);
    setRefresh(!refresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilter]);

  useEffect(() => {
    loadLocationStatus();
  }, [filter, loadLocationStatus, onlyErrors]);

  const handleActivateCM = async () => {
    try {
      dispatch(startWorking());
      await api.cm.activate(true);
      message.success(t("features-cm.cm_enabled"));
    } catch (error) {
      logger.error("Failed to activate CM", error);
      message.error(t("features-cm.cm_enable_error"));
    } finally {
      dispatch(stopWorking());
    }
    loadProviders();
  };

  const handleAddProvider = async () => {
    try {
      dispatch(startWorking());
      // find a fake domain name not already used in other providers
      let idxDomain = 1;
      while (providerList.find((p) => p.domains?.includes(`fakedomain-${idxDomain}.com`)))
        idxDomain++;
      // find a fake name not already used in other providers
      let idxName = 1;
      while (providerList.find((p) => p.name === `${t("features-cm.cm_provider_new")} - ${idxName}`)) idxName++;

      const newProvider = await api.cm.createProvider({
        name: `${t("features-cm.cm_provider_new")} - ${idxName}`,
        type: "O365",
        providerConfig: {
          tenantId: "",
          clientId: "",
          secret: "",
        },
        domains: [`fakedomain-${idxDomain}.com`],
      });
      providerIdToPreserve.current = newProvider.id;
      message.success(t("features-cm.cm_provider_added"));
      setSelectedProvider(newProvider);
      providerIdToPreserve.current = newProvider.id;
    } catch (error) {
      logger.error("Failed to add CM provider", error);
      message.error(t("features-cm.cm_provider_add_error"));
    } finally {
      dispatch(stopWorking());
    }

    loadProviders();
  };

  const handleSave = async (values) => {
    try {
      dispatch(startWorking());
      const newValues = { ...values };
      newValues.providerConfig.applicationServiceTokenMode =
        !newValues.providerConfig?.delegatedTokenMode;
      delete newValues.providerConfig?.delegatedTokenMode;

      // Verify that the name is not already used
      if (providerList.find((p) => p.name === newValues.name && p.id !== selectedProvider.id))
        return message.error(t("features-cm.cm_provider_name_already_used"));
      // O365 providers need at least one domain
      if (newValues.type === "O365" && newValues.domains.length === 0)
        return message.error(t("features-cm.cm_provider_domains_required"));
      // verify that the domains are not already used
      if (
        providerList.find(
          (p) =>
            R.intersection(
              (p.domains || []).map((d) => d.toLowerCase()),
              newValues.domains.map((d) => d.toLowerCase()),
            ).length > 0 && p.id !== selectedProvider.id,
        )
      )
        return message.error(t("features-cm.cm_provider_domain_already_used"));

      if (newValues.providerConfig?.secret === selectedProvider?.providerConfig?.secret)
        delete newValues.providerConfig.secret;

      await api.cm.updateProvider(selectedProvider.id, newValues);
      message.success(t("features-cm.cm_provider_config_saved"));
    } catch (error) {
      logger.error("Failed to save CM provider config", error);
      message.error(t("features-cm.cm_provider_config_save_error"));
    } finally {
      dispatch(stopWorking());
    }
    providerIdToPreserve.current = selectedProvider.id;
    loadProviders();
  };

  const handleCleanLocationsErrors = async () => {
    try {
      dispatch(startWorking());
      await api.cm.cleanLocationsErrors(selectedProvider.id);
      message.success(t("features-cm.cm_location_errors_cleaned"));
      setRefresh(!refresh);
    } catch (error) {
      logger.error("Failed to clean locations errors", error);
      message.error(t("features-cm.cm_location_errors_clean_error"));
    } finally {
      dispatch(stopWorking());
    }

    loadLocationStatus();
  };

  const handleDelete = async () => {
    try {
      dispatch(startWorking());
      await api.cm.deleteProvider(selectedProvider.id);
      message.success(t("features-cm.cm_provider_deleted"));
      setSelectedProvider(null);
    } catch (error) {
      logger.error("Failed to delete CM provider", error);
      message.error(t("features-cm.cm_provider_delete_error"));
    } finally {
      dispatch(stopWorking());
    }
    loadProviders();
  };

  const locationStatusColumns = useMemo(() => {
    return [
      {
        title: t("features-cm.cm_location_upn"),
        dataIndex: "upn",
        key: "upn",
        render: (text) => <Text>{text}</Text>,
      },
      {
        title: t("features-cm.cm_location_subscription_expiration"),
        dataIndex: "subscriptionExpiration",
        key: "subscriptionExpiration",
        width: 200,
        render: (date) => {
          const isPast = dayjs(date).isBefore(dayjs());
          return (
            <Text style={{ color: isPast ? "red" : "inherit" }}>{dayjs(date).format("LLL")}</Text>
          );
        },
      },
      {
        title: t("features-cm.cm_location_o365_subscription"),
        dataIndex: "subscriptionError",
        key: "o365Found",
        width: 100,
        render: (value, record) => {
          const isPast = dayjs(record.subscriptionExpiration).isBefore(dayjs());
          return value || isPast ? (
            <Tooltip title={value || t("features-cm.cm-unknown-error")}>
              <CloseOutlined style={{ color: "red", fontSize: "16px" }} />
            </Tooltip>
          ) : (
            <CheckOutlined style={{ color: "green", fontSize: "16px" }} />
          );
        },
      },
      {
        title: t("features-cm.cm_location_o365_found"),
        dataIndex: "o365Found",
        key: "o365Found",
        width: 100,
        render: (value, record) => {
          return value ? (
            <CheckOutlined style={{ color: "green", fontSize: "16px" }} />
          ) : (
            <Tooltip title={record.o365SearchError}>
              <CloseOutlined style={{ color: "red", fontSize: "16px" }} />
            </Tooltip>
          );
        },
      },
    ];
  }, [t]);

  const tabs = useMemo(() => {
    const tabs = [
      {
        key: "1",
        label: t("features-cm.cm_provider_config"),
        children: (
          <Form
            form={form}
            onFinish={handleSave}
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              offset: 1,
              span: 14,
            }}
            layout="horizontal"
          >
            <Card
              title={<Title level={4}>{t("features-cm.cm-provider-config")}</Title>}
              extra={
                <Flex justify="end" align="center" gap={10}>
                  <Button type="primary" htmlType="submit" disabled={!selectedProvider?.id}>
                    {t("components.save")}
                  </Button>
                  <Popconfirm
                    title={t("features-cm.cm_provider_delete_confirm")}
                    placement="left"
                    onConfirm={handleDelete}
                  >
                    <Button
                      type="primary"
                      danger
                      disabled={!selectedProvider?.id}
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Flex>
              }
              style={{
                width: "100%",
                marginTop: 20,
              }}
              bordered={false}
            >
              <MultiLineFormItem
                label={t("features-cm.cm-provider-name")}
                name="name"
                style={{ marginTop: "15px" }}
              >
                <Input autoComplete="off" />
              </MultiLineFormItem>
              <MultiLineFormItem
                label={t("features-cm.cm-provider-disabled")}
                name="disabled"
                style={{ marginTop: "15px" }}
                valuePropName="checked"
              >
                <Checkbox />
              </MultiLineFormItem>
              <MultiLineFormItem
                label={t("features-cm.cm-provider-type")}
                name="type"
                style={{ marginTop: "15px" }}
              >
                <Select style={{ width: "100%" }} disabled={!typeCanBeChanged}>
                  {PROVIDER_TYPES.map((item) => (
                    <Select.Option key={item.key} value={item.key}>
                      {item.value}
                    </Select.Option>
                  ))}
                </Select>
              </MultiLineFormItem>
              <MultiLineFormItem
                label={t("features-cm.cm-provider-o365-tenant-id")}
                name={["providerConfig", "tenantId"]}
                style={{ marginTop: "15px" }}
                hidden={selectedProvider?.type !== "O365"}
              >
                <Input autoComplete="off" />
              </MultiLineFormItem>
              <MultiLineFormItem
                label={t("features-cm.cm-provider-o365-client-id")}
                name={["providerConfig", "clientId"]}
                style={{ marginTop: "15px" }}
                hidden={selectedProvider?.type !== "O365"}
              >
                <Input autoComplete="off" />
              </MultiLineFormItem>
              <MultiLineFormItem
                label={t("features-cm.cm-provider-o365-client-secret")}
                name={["providerConfig", "secret"]}
                style={{ marginTop: "15px" }}
                hidden={selectedProvider?.type !== "O365"}
              >
                <Input autoComplete="off" />
              </MultiLineFormItem>
              <MultiLineFormItem
                label={t("features-cm.cm-provider-o365-delegated-token-mode")}
                name={["providerConfig", "delegatedTokenMode"]}
                style={{ marginTop: "15px" }}
                valuePropName="checked"
                hidden={selectedProvider?.type !== "O365"}
              >
                <Checkbox />
              </MultiLineFormItem>

              <MultiLineFormItem
                label={t("features-cm.cm-providerdomains")}
                name="domains"
                style={{ marginTop: "15px" }}
                hidden={selectedProvider?.type === "SWIZI"}
              >
                <DomainList />
              </MultiLineFormItem>
            </Card>
          </Form>
        ),
      },
    ];

    if (selectedProvider && selectedProvider.type === "O365")
      tabs.push({
        key: "Z",
        label: t("features-cm.cm-o365-locattion-Status"),
        children: (
          <Flex vertical align="start" gap={10} style={{ marginTop: 20 }}>
            <Flex justify="left" align="center" gap={20}>
              <Text strong style={{ width: "110px", flexShrink: 0 }}>
                {t("features-cm.cm-provider-locatio-name")}
              </Text>
              <Input
                autoComplete="off"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
              <Divider type="vertical" />
              <Text strong style={{ width: "220px", flexShrink: 0 }}>
                {t("features-cm.cm-provider-location-only-error")}
              </Text>
              <Checkbox
                checked={onlyErrors}
                onChange={(e) => setOnlyErrors(e.target.checked)}
                style={{ marginLeft: 10 }}
              />
              <Divider type="vertical" />

              <Button onClick={handleCleanLocationsErrors}>{t("features-cm.cm-clean-locations-errors")}</Button>
              <Divider type="vertical" />
              <Button
                icon={<SyncOutlined />}
                size="middle"
                style={{ border: "none", background: "none" }}
                onClick={() => setRefresh(!refresh)}
              />
            </Flex>
            <div style={{ width: "100%" }}>
              <Table
                loading={locationsAreLoading}
                columns={locationStatusColumns}
                dataSource={locationStatus}
                pagination={{
                  pageSize: pageSize,
                  current: page,
                  total: total,
                  onChange: (page, pageSize) => {
                    setPage(page);
                    setPageSize(pageSize);
                  },
                }}
              />
            </div>
          </Flex>
        ),
      });
    return tabs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    t,
    form,
    selectedProvider,
    typeCanBeChanged,
    filter,
    locationsAreLoading,
    locationStatusColumns,
    locationStatus,
    pageSize,
    page,
    total,
  ]);

  if (!useCM) {
    return (
      <>
        <Row style={{ marginTop: 20 }}>
          <Col span={24}>
            <Typography.Title level={2}>{t("features-cm.cm")}</Typography.Title>
          </Col>

          <Col span={24}>
            <Button onClick={handleActivateCM}>{t("features-cm.cm_not_enabled")}</Button>
          </Col>
        </Row>
      </>
    );
  } else {
    return (
      <>
        <Row style={{ marginTop: 20, width: "100%" }}>
          <Col span={24}>
            <Typography.Title level={2}>{t("features-cm.cm")}</Typography.Title>
          </Col>

          <Col span={24}>
            <Flex justify="left" align="center" gap={10}>
              <Typography.Text strong>{t("features-cm.cm_provider")}</Typography.Text>
              {/* provider selector */}
              <Select
                style={{ width: 200 }}
                value={selectedProvider?.id}
                onChange={(value) => setSelectedProvider(providerList.find((p) => p.id == value))}
              >
                {providerList.map((provider) => (
                  <Select.Option key={provider.id} value={provider.id}>
                    {provider.name} ({provider.type})
                  </Select.Option>
                ))}
              </Select>
              <Button onClick={handleAddProvider}>{t("features-cm.cm_add_provider")}</Button>
            </Flex>
          </Col>
          <Col span={24}>
            <Tabs
              defaultActiveKey="1"
              items={tabs}
              style={{ width: "100%", marginTop: 20 }}
              tabBarStyle={{ marginBottom: 0 }}
              tabBarGutter={20}
            />
          </Col>
        </Row>
      </>
    );
  }
};

export default CMView;
