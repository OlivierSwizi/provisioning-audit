import { useTranslation } from "react-i18next";
import { Row, Col, Typography, Table, message, DatePicker, Button } from "antd";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import SiteSelector from "@/components/SiteSelector";

import referential from "./referential.json";
import dayjs from "dayjs";

import { SyncOutlined } from "@ant-design/icons";

import { useTextAreaModal } from "@/components/modal/TextAreaModal";
import logger from "@/logger";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const HistoryView = () => {
  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);

  const [siteId, setSiteId] = useState(null);
  const [filter, setFilter] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState(dayjs().startOf("day").subtract(1, "month"));
  const [endDate, setEndDate] = useState(dayjs().endOf("day"));
  const [roomList, setRoomList] = useState([]);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [resetPage, setResetPage] = useState(false);

  const [editText, TextAreaModal] = useTextAreaModal();

  useEffect(() => {
    setLoadingFailed(false);
  }, [siteId]);

  useEffect(() => {
    if (!appId || !siteId) return;

    const doIt = async () => {
      if (loadingFailed) return;
      setIsLoading(true);
      try {
        const result = await api.history.getHistory(
          siteId,
          resetPage ? 1 : page,
          pageSize,
          filter,
          startDate.toISOString(),
          endDate.toISOString(),
        );
        const { items, itemCount } = result;
        setItemCount(itemCount);

        if (resetPage) {
          setResetPage(false);
          setPage(1);
        }

        setData(
          items.map((item) => ({
            ...item,
            key: item.id,
            data: !item.data
              ? ""
              : item.data?.lastOccupancy === undefined
              ? t("meeting-infos", {
                  start: new Date(item.data.startDate).toLocaleString(),
                  end: new Date(item.data.endDate).toLocaleString(),
                  organizer: item.data.organizer,
                })
              : t("meeting-infos-occupancy", {
                  start: new Date(item.data.startDate).toLocaleString(),
                  end: new Date(item.data.endDate).toLocaleString(),
                  organizer: item.data.organizer,
                  lastOccupancy: item.data?.lastOccupancy?.toFixed(1),
                }),
          })),
        );
      } catch (error) {
        logger.error(error);
        setLoadingFailed(true);
        message.error(t("error"));
        setPage(1);
        setPageSize(10);
        setFilter({});
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, startDate, endDate, filter, pageSize, resetPage, appId, siteId, refreshFlag]);

  useEffect(() => {
    setPage(1);
    setPageSize(10);
    setRefreshFlag(!refreshFlag);
    const loadRooms = async () => {
      if (!siteId) return;
      try {
        const result = await api.history.listHistoryRooms(siteId);
        setRoomList(result);
      } catch (error) {
        logger.error(error);
        message.error(t("error-loading-rooms"));
      }
    };

    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, siteId]);

  const HistoryData = ({ value, record }) => {
    const showData = async () => {
      await editText(record.room + " / " + t(record.action), value);
    };
    if (record.service === "NOSHOW") {
      return (
        <div
          style={{
            width: "350px",

            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          onClick={showData}
        >
          {value}
        </div>
      );
    }
    return <span />;
  };

  const columns = [
    {
      title: <span>{t("date")}</span>,
      dataIndex: "timestamp",
      render: (value) => {
        return <span>{new Date(value).toLocaleString()}</span>;
      },
    },
    {
      title: <span>{t("service")}</span>,
      dataIndex: "service",
      filters: referential.SERVICES.map((service) => ({
        text: t(service.i18nKey),
        value: service.key,
      })),

      render: (value) => <span>{t(value)}</span>,
    },
    {
      title: <span>{t("event")}</span>,
      dataIndex: "action",
      render: (value) => <span>{t(value)}</span>,
    },
    {
      title: <span>{t("room")}</span>,
      dataIndex: "room",
      filters: roomList.map((room) => ({ text: room, value: room })),
    },
    {
      title: <span>{t("data")}</span>,
      dataIndex: "data",
      width: "250",
      render: (value, record) => <HistoryData value={value} record={record} />,
    },
  ];

  return (
    <>
      {TextAreaModal}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={20}>
              <SiteSelector
                value={siteId}
                onChange={setSiteId}
                size="large"
                style={{ width: "250px", marginBottom: "25px" }}
              />
            </Col>
            <Col span={24}>
              <Row style={{ width: "100%" }}>
                <Col span={24}>
                  <Title level={3}>{t("history")}</Title>
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
                    onChange={(pagination, filters) => {
                      setPage(pagination.current);
                      setPageSize(pagination.pageSize);
                      setFilter(filters);
                    }}
                    pagination={{
                      current: page,
                      pageSize: pageSize,
                      showSizeChanger: true,
                      total: itemCount,
                      pageSizeOptions: ["10", "20", "30", "40"],
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default HistoryView;
