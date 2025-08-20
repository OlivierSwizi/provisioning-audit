import { DeleteOutlined } from "@ant-design/icons";
import Editor from "@monaco-editor/react";

import { useTranslation } from "react-i18next";
import * as R from "ramda";
import {
  Row,
  Col,
  Typography,
  Table,
  message,
  DatePicker,
  Button,
  Tabs,
  Checkbox,
  Popconfirm,
} from "antd";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import { useJSONEditorModal } from "@/components/modal/JSONEditorModal";
import { useSelectModal } from "@/components/modal/SelectModal";
import { useShowCopyableTextModal } from "@/components/modal/ShowCopyableTextModal";

import dayjs from "dayjs";

import { SyncOutlined } from "@ant-design/icons";
import logger from "@/logger";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SCIMHistoryView = () => {
  const { t } = useTranslation();
  const [editJSON, JSONEditorModal] = useJSONEditorModal();
  const [askSelect, SelectModal] = useSelectModal();
  const [showCopyableText, ShowCopyableTextModal] = useShowCopyableTextModal();

  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);

  const [filter, setFilter] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().startOf("day").subtract(1, "month"));
  const [endDate, setEndDate] = useState(dayjs().endOf("day"));
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [endPoint, setEndPoint] = useState("");
  const [logAllCalls, setLogAllCalls] = useState(false);
  const [mappingUser, setMappingUser] = useState({});
  const [mappingGroup, setMappingGroup] = useState({});
  const [tokens, setTokens] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const prevState = useRef({});

  const loadSettings = async () => {
    try {
      const config = await api.scim.getConfig();

      setEndPoint(config.endpoint);
      setLogAllCalls(config.logAllCalls);
      setMappingUser(JSON.stringify(config.mapping.user, undefined, 2));
      setMappingGroup(JSON.stringify(config.mapping.group, undefined, 2));
      setTokens(config.tokens.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
      setTimeout(() => {
        setIsLoaded(true);
      }, 500);
    } catch (error) {
      logger.error(error);
      message.error(t("features-planner.error-load-scim-settings"));
    } finally {
      setIsLoading(false);
    }
  };

  const revokeToken = async (secretId) => {
    setIsLoading(true);
    try {
      await api.scim.revokeToken(secretId);
      message.success(t("features-scim.success-removing-token"));
    } catch (error) {
      logger.error(error);
      message.error(t("features-scim.error-removing-token"));
    } finally {
      setIsLoading(false);
    }

    loadSettings();
  };

  const addToken = async () => {
    const duration = await askSelect(t("features-scim.token-duration"), t("features-scim.select-duration"), [
      { value: 1, label: t("features-scim.1-month") },
      { value: 3, label: t("features-scim.3-month") },
      { value: 6, label: t("features-scim.6-month") },
      { value: 12, label: t("features-scim.1-year") },
    ]);

    if (!duration) return;

    try {
      const token = await api.scim.addToken(duration);
      message.success(t("features-scim.success-adding-token"));
      await showCopyableText(t("features-scim.show-token-text"), t("features-scim.show-token-instruction"), token.token);
    } catch (error) {
      logger.error(error);
      message.error(t("features-scim.error-adding-token"));
    }

    loadSettings();
  };

  const saveSettings = async () => {
    try {
      await api.scim.updateConfig({
        logAllCalls: logAllCalls,
        mapping: {
          user: JSON.parse(mappingUser),
          group: JSON.parse(mappingGroup),
        },
      });
      message.success(t("features-scim.success-scim-save-settings"));
    } catch (error) {
      logger.error(error);
      message.error(t("features-planner.error-scim-save-settings"));
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async (currentPage = page) => {
    setIsLoading(true);
    try {
      const { items, pageCount } = await api.scim.getHistory(
        currentPage,
        pageSize,
        filter,
        startDate.toISOString(),
        endDate.toISOString(),
      );
      setPageCount(pageCount);
      setPage(currentPage);
      setData(
        items.map((item) => ({
          ...item,
          key: item.id,
        })),
      );
    } catch (error) {
      logger.error(error);
      message.error(t("features-scim.error-scim-load-history"));
      setPage(1);
      setPageSize(10);
      setFilter({});
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanHistory = async () => {
    setIsLoading(true);
    try {
      await api.scim.cleanHistory();
      message.success(t("features-scim.success-cleaning-history"));
    } catch (error) {
      logger.error(error);
      message.error(t("features-scim.error-cleaning-history"));
    } finally {
      setIsLoading(false);
    }
    loadHistory();
  };

  useEffect(() => {
    if (appId) loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  (useEffect(() => {
    if (isLoaded) {
      saveSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logAllCalls]),
    useEffect(
      () => {
        if (!appId) return;
        const currentPage =
          !prevState.current.page ||
          !prevState.current.filter ||
          !R.equals(prevState.current.filter, filter)
            ? 1
            : page;

        prevState.current = { page, filter, startDate, endDate, refreshFlag };
        loadHistory(currentPage);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [appId, page, pageSize, filter, startDate, endDate, refreshFlag],
    ));

  const History = () => {
    const columns = [
      {
        title: <span>{t("features-history.date")}</span>,
        dataIndex: "timestamp",

        render: (value) => {
          return <span>{new Date(value).toLocaleString()}</span>;
        },
      },
      {
        title: <span>{t("features-scim.status")}</span>,
        dataIndex: "status",
        filters: [],

        render: (value) => {
          return (
            <span
              style={{
                color: `${value}`.startsWith("20") ? "green" : "red",
              }}
            >
              {t(value)}
            </span>
          );
        },
      },
      {
        title: <span>{t("features-scim.operation")}</span>,
        dataIndex: "operation",
        render: (value) => <span>{t(value)}</span>,
      },
      {
        title: <span>{t("features-scim.resource")}</span>,
        dataIndex: "resource",
      },
      {
        title: <span>{t("features-history.data")}</span>,
        dataIndex: "data",
        width: "350",
        render: (value) => (
          <div
            style={{
              width: "450px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
            onClick={() => editJSON(t("features-history.data"), value)}
          >
            {JSON.stringify(value)}
          </div>
        ),
      },
    ];
    return (
      <Row style={{ width: "100%" }}>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={24}>
              <Title level={3}>{t("features-history.history")}</Title>
            </Col>
            <Col span={22}>
              <RangePicker
                style={{ marginBottom: "25px" }}
                value={[startDate, endDate]}
                format="YYYY-MM-DD HH:mm"
                onChange={(dates) => {
                  setStartDate(dayjs(dates[0]).startOf("day"));
                  setEndDate(dayjs(dates[1]).endOf("day"));
                }}
              />
            </Col>
            <Col span={2}>
              <Button
                icon={<SyncOutlined />}
                size="middle"
                style={{ border: "none" }}
                onClick={() => setRefreshFlag(!refreshFlag)}
              />
            </Col>
            <Col span={24}>
              <Table
                columns={columns}
                dataSource={data}
                loading={isLoading}
                size="small"
                onChange={(pagination, filters) => {
                  setPage(pagination.current);
                  setPageSize(pagination.pageSize);
                  setFilter(filters);
                }}
                pagination={{
                  current: page,
                  pageSize: pageSize,
                  showSizeChanger: true,
                  total: pageCount,
                  pageSizeOptions: ["10", "20", "30", "40"],
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col span={24} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Button
            onClick={cleanHistory}
            style={{
              marginTop: "24px",

              width: "250px",
            }}
          >
            {t("features-scim.clean-scim-history")}
          </Button>
        </Col>
      </Row>
    );
  };

  const Settings = ({ tokens }) => {
    const tokenColumns = [
      {
        title: <span>{t("features-scim.creation-date")}</span>,
        dataIndex: "createdAt",
        width: "170px",
        align: "center",
        render: (value) => {
          return <span>{dayjs(value).format("LLL")}</span>;
        },
      },
      {
        title: <span>{t("features-scim.id")}</span>,
        dataIndex: "secretId",
        align: "center",
        width: "300px",
      },
      {
        title: <span>{t("features-scim.token")}</span>,
        dataIndex: "token",
        align: "center",
        width: "100px",
      },
      {
        title: <span>{t("features-scim.expire-date")}</span>,
        dataIndex: "expiresAt",
        align: "center",
        width: "100px",
        render: (value) => {
          return <span>{dayjs(value, "YY/MM/DD").format("L")}</span>;
        },
      },
      {
        title: <span>{t("features-scim.revoke")}</span>,
        align: "center",
        render: (value) => {
          return (
            <div style={{ width: "100%", textAlign: "center" }}>
              <Popconfirm title={t("features-scim.revoke-token")} onConfirm={() => revokeToken(value.secretId)}>
                <DeleteOutlined style={{ color: "red" }} />
              </Popconfirm>
            </div>
          );
        },
      },
    ];

    return (
      <>
        <Row style={{ width: "100%", marginTop: "24px" }}>
          <Col span={4}>
            <Text>{t("features-scim.log-all-scim-call")}</Text>
          </Col>
          <Col span={20}>
            <Checkbox checked={logAllCalls} onChange={(e) => setLogAllCalls(e.target.checked)} />
          </Col>
        </Row>
        <Row style={{ width: "100%", marginTop: "24px" }}>
          <Col span={4}>
            <Text>{t("features-scim.scim-endpoint")}</Text>
          </Col>
          <Col span={20}>
            <Text copyable>{endPoint}</Text>
          </Col>
        </Row>
        {tokens && (
          <Row style={{ width: "100%", marginTop: "24px" }}>
            <Col span={15}>
              <Table
                columns={tokenColumns}
                dataSource={tokens}
                loading={isLoading}
                size="small"
                pagination={false}
              />
            </Col>
            <Col
              span={15}
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button onClick={addToken}>{t("features-scim.add-a-token")}</Button>
            </Col>
          </Row>
        )}
      </>
    );
  };

  const Mapping = () => {
    const tab = [
      {
        label: t("features-scim.scim-user-mapping"),
        key: "user",
        children: (
          <Row style={{ width: "100%" }} key="user">
            <Col span={24}>
              <Editor
                language="json"
                height={"600px"}
                options={{ automaticLayout: true, minimap: { enabled: false } }}
                value={mappingUser}
                onChange={setMappingUser}
              />
            </Col>
            <Col
              span={24}
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <Button
                onClick={saveSettings}
                style={{
                  marginTop: "24px",

                  width: "250px",
                }}
              >
                {t("components.save")}
              </Button>
            </Col>
          </Row>
        ),
      },
      {
        label: t("features-scim.scim-group-mapping"),
        key: "group",
        children: (
          <Row style={{ width: "100%" }} key="group">
            <Col span={24}>
              <Editor
                language="json"
                height={"500px"}
                options={{ automaticLayout: true, minimap: { enabled: false } }}
                value={mappingGroup}
                onChange={setMappingGroup}
              />
            </Col>
            <Col
              span={24}
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <Button
                onClick={saveSettings}
                style={{
                  marginTop: "24px",

                  width: "250px",
                }}
              >
                {t("components.save")}
              </Button>
            </Col>
          </Row>
        ),
      },
    ];

    return (
      <Row key="mapping" style={{ width: "100%", marginTop: "24px" }}>
        <Col span={24}>
          <Tabs items={tab} />
        </Col>
      </Row>
    );
  };

  const tabItems = [
    { label: t("features-scim.settings"), key: "settings", children: <Settings tokens={tokens} /> }, // remember to pass the key prop
    { label: t("features-scim.mapping"), key: "mapping", children: <Mapping /> }, // remember to pass the key prop
    { label: t("features-scim.scim-history"), key: "log", children: <History /> },
  ];

  return (
    <>
      {JSONEditorModal}
      {SelectModal}
      {ShowCopyableTextModal}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Tabs items={tabItems} />
        </Col>
      </Row>
    </>
  );
};

export default SCIMHistoryView;
