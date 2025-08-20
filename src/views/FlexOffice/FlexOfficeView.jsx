import { useTranslation } from "react-i18next";
import { isNil } from "ramda";
import {
  Row,
  Col,
  Button,
  message,
  Form,
  Typography,
  Tabs,
  DatePicker,
  Divider,
  Table,
} from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import SiteSelector from "@/components/SiteSelector";

import { startWorking, stopWorking } from "@/services/features/UISlice";
import { useForm } from "antd/lib/form/Form";

import logger from "@/logger";
import UserSearch from "@/components/UserSearch";
import dayjs from "dayjs";
import DeskSearch from "@/components/DeskSearch";

const FlexOfficeView = () => {
  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const dispatch = useDispatch();

  const [siteId, setSiteId] = useState(null);

  const [activeTab, setActiveTab] = useState("search-by-user");

  useEffect(() => {
    if (!appId || !siteId) return;
  }, [appId, siteId]);

  const SearchByUser = ({}) => {
    const [form] = useForm();

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPageCount, setTotalPageCount] = useState(0);

    const [currentUser, setCurrentUser] = useState(null);
    const [currentSelection, setCurrentSelection] = useState(null);

    useEffect(() => {
      form.setFieldsValue({ user: null, from: dayjs() });
      return () => {
        // Cleanup logic if needed
      };
    }, []);

    const search = async (values, selectedPage) => {
      try {
        await dispatch(startWorking());

        if (!values && currentSelection) values = currentSelection;
        else setCurrentSelection(values);

        const { user, from } = values;
        if (isNil(user)) {
          message.error(t("flexoffice-user-required"));
          return;
        }
        const userId = user.id;
        const fromStartOfDay = dayjs(from).startOf("day").toISOString();
        const { items, page, pageSize, totalPageCount } = await api.flexoffice.listUserBooking(
          siteId,
          userId,
          fromStartOfDay,
          selectedPage || 1,
          10,
        );
        setItems(items);
        setPage(page);
        setPageSize(pageSize);
        setTotalPageCount(totalPageCount);
        setCurrentUser(user);
        if (items.length === 0) {
          message.info(t("flexoffice-no-results"));
        }
      } catch (error) {
        logger.error(error);
        message.error(t("flexoffice-search-error"));
      } finally {
        await dispatch(stopWorking());
      }
    };

    const handleUpdatePage = (page) => {
      search(null, page);
    };

    return (
      <>
        <Row style={{ marginTop: 20 }}>
          <Col span={24}>
            <Typography.Title level={3}>{t("flexoffice-search-by-user")}</Typography.Title>
          </Col>
          <Col span={24}>
            <Form form={form} onFinish={search} layout="vertical" style={{ width: "100%" }}>
              <Row gutter={16} align="bottom">
                <Col span={6}>
                  <Form.Item
                    name="user"
                    label={t("user")}
                    rules={[{ required: true, message: t("required") }]}
                  >
                    <UserSearch showEmail size="large" />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item
                    name="from"
                    label={t("from")}
                    rules={[{ required: true, message: t("required") }]}
                  >
                    <DatePicker size="large" />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large">
                      {t("search")}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
        <Divider style={{ margin: "20px 0" }} />
        {currentUser && (
          <Row style={{ marginTop: 20 }}>
            <Col span={24}>
              <Typography.Title level={3}>
                {t("flexoffice-booking-of-user")} {currentUser.firstname} {currentUser.lastname}
              </Typography.Title>
            </Col>
            <Col span={24}>
              <Table
                rowKey="id"
                dataSource={items}
                pagination={{
                  current: page,
                  pageSize: pageSize,
                  total: totalPageCount * pageSize,
                  onChange: (page, pageSize) => handleUpdatePage(page, pageSize),
                }}
                columns={[
                  {
                    title: t("date"),
                    dataIndex: "date",
                    key: "date",
                    render: (_, record) => <span>{dayjs(record.date).format("DD/MM/YYYY")}</span>,
                  },
                  {
                    title: t("flexoffice-period"),
                    dataIndex: "period",
                    key: "period",
                    render: (_, record) => (
                      <span>
                        {record.morning && record.afternoon
                          ? t("flex-office-all-day")
                          : record.morning
                            ? "flex-office-morning"
                            : t("flex-office-afternoon")}
                      </span>
                    ),
                  },
                  {
                    title: t("flexoffice-desk"),
                    dataIndex: "desk",
                    key: "desk",
                    render: (_, record) => (
                      <span>
                        {record.desk.title} ({record.desk.reference})
                      </span>
                    ),
                  },

                  {
                    title: t("flexoffice-confirmed"),
                    dataIndex: "confirmed",
                    key: "confirmed",
                    render: (_, record) => <span>{record.confirmed ? t("yes") : t("no")}</span>,
                  },
                  {
                    title: t("flexoffice-booking-date"),
                    dataIndex: "bookingDate",
                    key: "bookingDate",
                    render: (_, record) => (
                      <span>{dayjs(record.bookingDate).format("DD/MM/YY HH:mm")}</span>
                    ),
                  },
                ]}
              />
            </Col>
          </Row>
        )}
      </>
    );
  };

  const SearchByDesk = ({}) => {
    const [form] = useForm();

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPageCount, setTotalPageCount] = useState(0);

    const [currentDesk, setCurrentDesk] = useState(null);
    const [currentSelection, setCurrentSelection] = useState(null);

    useEffect(() => {
      form.setFieldsValue({ desk: null, from: dayjs() });
      return () => {
        // Cleanup logic if needed
      };
    }, []);

    const search = async (values, selectedPage) => {
      try {
        dispatch(startWorking());

        if (!values && currentSelection) values = currentSelection;
        else setCurrentSelection(values);

        const { desk, from } = values;
        if (isNil(desk)) {
          message.error(t("flexoffice-desk-required"));
          return;
        }
        const fromStartOfDay = dayjs(from).startOf("day").toISOString();
        const { items, page, pageSize, totalPageCount } = await api.flexoffice.listDeskBooking(
          siteId,
          desk.uid,
          fromStartOfDay,
          selectedPage || 1,
          10,
        );
        setItems(
          items.map((item) => ({
            ...item,
            key: item.id,
          })),
        );
        setPage(page);
        setPageSize(pageSize);
        setTotalPageCount(totalPageCount);
        setCurrentDesk(desk);
        if (items.length === 0) {
          message.info(t("flexoffice-no-results"));
        }
      } catch (error) {
        logger.error(error);
        message.error(t("flexoffice-search-error"));
      } finally {
        await dispatch(stopWorking());
      }
    };

    const handleUpdatePage = (page) => {
      search(null, page);
    };

    return (
      <>
        <Row style={{ marginTop: 20 }}>
          <Col span={24}>
            <Typography.Title level={3}>{t("flexoffice-search-by-desk")}</Typography.Title>
          </Col>
          <Col span={24}>
            <Form form={form} onFinish={search} layout="vertical" style={{ width: "100%" }}>
              <Row gutter={16} align="bottom">
                <Col span={6}>
                  <Form.Item
                    name="desk"
                    label={t("flex-office-desk")}
                    rules={[{ required: true, message: t("flexoffice-required") }]}
                  >
                    <DeskSearch siteId={siteId} />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item
                    name="from"
                    label={t("from")}
                    rules={[{ required: true, message: t("flexoffice-required") }]}
                  >
                    <DatePicker size="large" />
                  </Form.Item>
                </Col>
                <Col>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" size="large">
                      {t("search")}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
        <Divider style={{ margin: "20px 0" }} />
        {currentDesk && (
          <Row style={{ marginTop: 20 }}>
            <Col span={24}>
              <Typography.Title level={3}>
                {t("flexoffice-booking-of-desk")} {currentDesk.title} ({currentDesk.reference})
              </Typography.Title>
            </Col>
            <Col span={24}>
              <Table
                rowKey="id"
                dataSource={items}
                pagination={{
                  current: page,
                  pageSize: pageSize,
                  total: totalPageCount * pageSize,
                  onChange: (page, pageSize) => handleUpdatePage(page, pageSize),
                }}
                columns={[
                  {
                    title: t("date"),
                    dataIndex: "date",
                    key: "date",
                    render: (_, record) => <span>{dayjs(record.date).format("DD/MM/YYYY")}</span>,
                  },
                  {
                    title: t("flexoffice-period"),
                    dataIndex: "period",
                    key: "period",
                    render: (_, record) => (
                      <span>
                        {record.morning && record.afternoon
                          ? t("flex-office-all-day")
                          : record.morning
                            ? "flex-office-morning"
                            : t("flex-office-afternoon")}
                      </span>
                    ),
                  },
                  {
                    title: t("flexoffice-user"),
                    dataIndex: "user",
                    key: "user",
                    render: (_, record) => <span>{record.email}</span>,
                  },

                  {
                    title: t("flexoffice-confirmed"),
                    dataIndex: "confirmed",
                    key: "confirmed",
                    render: (_, record) => <span>{record.confirmed ? t("yes") : t("no")}</span>,
                  },
                  {
                    title: t("flexoffice-booking-date"),
                    dataIndex: "bookingDate",
                    key: "bookingDate",
                    render: (_, record) => (
                      <span>{dayjs(record.bookingDate).format("DD/MM/YY HH:mm")}</span>
                    ),
                  },
                ]}
              />
            </Col>
          </Row>
        )}
      </>
    );
  };

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Typography.Title level={2}>{t("flexoffice-monitor")}</Typography.Title>
        </Col>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={4}>
              <SiteSelector
                value={siteId}
                onChange={setSiteId}
                size="medium"
                style={{ width: "250px", marginBottom: "25px" }}
                allowClear={false}
              />
            </Col>
          </Row>
          <Row style={{ width: "100%" }}>
            <Col span={24}>
              <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key)}
                items={[
                  {
                    label: t("flexoffice-search-by-user"),
                    key: "search-by-user",
                    children: <SearchByUser />,
                  },
                  {
                    label: t("flexoffice-search-by-desk"),
                    key: "search-by-desk",
                    children: <SearchByDesk />,
                  },
                ]}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default FlexOfficeView;
