import { useTranslation } from "react-i18next";
import { Row, Col, Button, Typography, Tabs, Table, message } from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import SiteSelector from "@/components/SiteSelector";

import { startWorking, stopWorking } from "@/services/features/UISlice";

import { extractLocalizedString } from "@/helpers";

import logger from "@/logger";
import GroupSelector from "@/components/GroupSelector";
import GroupList from "@/views/Groups/GroupList";

const BIView = () => {
  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const dispatch = useDispatch();
  const [siteId, setSiteId] = useState(null);
  const [reports, setReports] = useState([]);

  const loadConfig = async (config) => {
    try {
      await dispatch(startWorking());
      const config = await api.bi.listPermissions(siteId);
      setReports(
        (config.reports || [])
          .map((report) => ({
            id: report.id,
            title: extractLocalizedString(report.title),
            groups: config.permissions.find((p) => p.reportId === report.id)?.groupIds || [],
          }))
          .sort((a, b) => a.title.localeCompare(b.title)),
      );
    } catch (error) {
      logger.error(error);
    } finally {
      await dispatch(stopWorking());
    }
  };

  useEffect(() => {
    if (!appId || !siteId) return;

    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, siteId]);

  const updatePermission = async (reportId, groupIds) => {
    try {
      await dispatch(startWorking());
      await api.bi.updatePermissions(siteId, reportId, groupIds);
    } catch (error) {
      logger.error(error);
      message.error(t("error-saving-permissions"));
    } finally {
      await dispatch(stopWorking());
    }

    loadConfig();
  };

  const tabs = [
    {
      key: "1",
      label: t("permissions"),
      children: (
        <Row>
          <Col span={22} style={{ marginTop: "20px" }}>
            <Table
              rowKey="id"
              dataSource={reports}
              columns={[
                {
                  title: t("report"),
                  dataIndex: "title",
                  width: 350,
                  key: "title",
                  render: (text, record) => <Typography.Text strong>{text}</Typography.Text>,
                },
                {
                  title: t("authorized.groups"),
                  dataIndex: "groups",
                  key: "groups",
                  render: (groups, record) => (
                    <GroupSelector
                      mode="tags"
                      size="middle"
                      value={groups}
                      onChange={(groupIds) => updatePermission(record.id, groupIds)}
                    />
                  ),
                },
              ]}
              pagination={false}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <>
      <Row>
        <Col span={24}>
          <Typography.Title level={2}>{t("bi")}</Typography.Title>
        </Col>
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
              <Tabs
                defaultActiveKey="1"
                items={tabs}
                style={{ width: "100%", marginTop: 20 }}
                tabBarStyle={{ marginBottom: 0 }}
                tabBarGutter={20}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default BIView;
