import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { Row, Col, Typography, Card, message, Select, Button } from "antd";
import { DatePicker } from "antd";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import logger from "@/logger";

import { API } from "@/services/features/AuthSlice";

import { startWorking, stopWorking } from "@/services/features/UISlice";

import dayjs from "dayjs";
const { RangePicker } = DatePicker;

const AudienceView = ({ admin = false }) => {
  const { t } = useTranslation();
  const app = useSelector((state) => state.apps.selectedApp);
  const api = useSelector(API);
  const access = useSelector((state) => state.auth.access);

  const dispatch = useDispatch();

  const [startDate, setStartDate] = useState(dayjs().startOf("day").subtract(1, "month"));
  const [endDate, setEndDate] = useState(dayjs().endOf("day"));
  const [path, setPath] = useState("day");
  const [data, setData] = useState([]);

  const pathOptions = useMemo(() => {
    return [
      { label: t("audience.day"), value: "day" },
      { label: t("audience.week"), value: "week" },
      { label: t("audience.month"), value: "month" },
      { label: t("audience.year"), value: "year" },
    ];
  }, [t]);

  const updateData = async () => {
    try {
      await dispatch(startWorking());
      const data = admin
        ? await api.audience.getGlobalAnalytics(
            startDate.format("YYYY-MM-DD"),
            endDate.format("YYYY-MM-DD"),
            path,
          )
        : await api.audience.getAnalytics(
            startDate.format("YYYY-MM-DD"),
            endDate.format("YYYY-MM-DD"),
            path,
          );
      setData(data);
    } catch (e) {
      logger.error(e);
      message.error(t("audience.load-error"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const blob = await api.audience.downloadUsers(
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD"),
        path,
      );
      const timestamp = dayjs().format("YYYY-MM-DD-HH-mm-ss");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${app.name}-audience-${timestamp}.xlsx`;
      a.click();
      message.success(t("audience.download-success"));
    } catch (error) {
      logger.log(error);
      message.error(t("audience.error-occurred"));
    }
  };

  useEffect(() => {
    if (!app && !admin) return;

    updateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app, startDate, endDate, path]);

  return (
    <Card
      title={
        <Row justify="space-between" align="middle" style={{ width: "100%" }}>
          <Col>
            <Typography.Text>{t("audience.unique-user-graph")}</Typography.Text>
          </Col>
          {access.superAdmin && (
            <Col>
              <Button size="middle" onClick={handleDownloadExcel}>
                {t("audience.download-analytics-users")}
              </Button>
            </Col>
          )}
        </Row>
      }
      style={{ width: "100%", height: "80vh" }}
      bordered={false}
    >
      <Row width="100%">
        <Col span={8} style={{ display: "flex", alignItems: "center" }}>
          <Typography.Text>{t("audience.period")}</Typography.Text>

          <RangePicker
            style={{ marginLeft: "20px" }}
            value={[startDate, endDate]}
            onChange={(dates) => {
              setStartDate(dates[0]);
              setEndDate(dates[1]);
            }}
            format="DD/MM/YYYY"
          />
        </Col>
        <Col span={8} style={{ display: "flex", alignItems: "center" }}>
          <Typography.Text>{t("audience.analytic-path")}</Typography.Text>
          <Select
            style={{ marginLeft: "10px", width: "100px" }}
            options={pathOptions}
            value={path}
            onChange={(value) => setPath(value)}
            size="middle"
          />
        </Col>
        <Col span={22} style={{ marginTop: "25px" }}>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(tick) => {
                  return tick;
                }}
              />
              <YAxis />
              <Tooltip labelFormatter={(label) => dayjs(label).format("DD/MM/YYYY")} />
              <Line type="monotone" dataKey="value" stroke="rgb(38, 117, 166)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Card>
  );
};

export default AudienceView;
