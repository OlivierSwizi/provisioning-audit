import { useTranslation } from "react-i18next";
import * as R from "ramda";
import {
  Row,
  Col,
  Typography,
  Button,
  Card,
  Form,
  Select,
  InputNumber,
  Checkbox,
  message,
} from "antd";

import { startWorking, stopWorking } from "@/services/features/UISlice";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import GroupSelector from "@/components/GroupSelector";
import UserListSelect from "@/components/UserListSelect";
import MultiLineFormItem from "@/components/MultiLineFormItem";
import { useForm } from "antd/lib/form/Form";

import { API } from "@/services/features/AuthSlice";
import EmailTemplateEditor from "@/components/template-editors/EmailTemplateEditor";
import SiteSelector from "@/components/SiteSelector";

import keywords from "./keywords.js";
import RangeTimePicker from "@/components/RangeTimePicker.jsx";
import logger from "@/logger.js";

const { Title } = Typography;

const NoShowView = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);

  const [showWhiteList, setShowWhiteList] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [templates, setTemplates] = useState();
  const [checkOccupancyType, setCheckOccupancyType] = useState();
  const [siteId, setSiteId] = useState(null);

  const [form] = useForm();

  const NO_SHOW_TYPES = [
    {
      key: 0,
      value: t("features-noshow.no-show-disabled"),
    },
    {
      key: 1,
      value: t("features-noshow.no-show-config-1"),
    },
    {
      key: 2,
      value: t("features-noshow.no-show-config-2"),
    },
    {
      key: 3,
      value: t("features-noshow.no-show-config-3"),
    },
  ];

  const CHECK_OCCUPANCY_TYPES = [
    {
      key: "ON_TIME",
      value: t("features-noshow.no-show-check-occupancy-on-time"),
    },
    {
      key: "ON_PERIOD",
      value: t("features-noshow.no-show-check-occupancy-on-period"),
    },
  ];

  useEffect(() => {
    if (!appId || !siteId) return;

    const doIt = async () => {
      const config = await api.features.getNoShowConfig(siteId);
      let values = Object.assign(
        {},
        R.pick(
          [
            "type",
            "maxResponseTime",
            "roomMaxDuration",
            "isWhiteListEnabled",
            "whiteList",
            "excludedGroups",
            "checkOccupancyType",
            "checkOccupancyPeriod",
            "actionRange",
          ],
          config,
        ),
        R.pick(["releaseRoom_type_2", "releaseRoom_type_3"], {
          releaseRoom_type_2: { subject: "", content: "" },
          releaseRoom_type_3: { subject: "", content: "" },
          ...config.templates,
        }),
      );
      if (values.isWhiteListEnabled == null) values.isWhiteListEnabled = true;
      form.setFieldsValue(values);
      setTemplates(config.type);
      setShowWhiteList(config.isWhiteListEnabled);
      setShowConfig(config.type !== 0);
      setCheckOccupancyType(config.checkOccupancyType);
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, siteId]);

  const handleFieldsChange = () => {
    setShowWhiteList(form.getFieldValue("isWhiteListEnabled"));
    setShowConfig(form.getFieldValue("type") !== 0);
    setTemplates(form.getFieldValue("type"));
    setCheckOccupancyType(form.getFieldValue("checkOccupancyType"));
  };

  const handleSave = async () => {
    try {
      await dispatch(startWorking());
      await api.features.setNoShowConfig(siteId, {
        ...R.pick(
          [
            "type",
            "maxResponseTime",
            "roomMaxDuration",
            "isWhiteListEnabled",
            "whiteList",
            "excludedGroups",
            "checkOccupancyType",
            "checkOccupancyPeriod",
            "actionRange",
          ],
          form.getFieldsValue(),
        ),
        templates: R.pick(["releaseRoom_type_2", "releaseRoom_type_3"], form.getFieldsValue()),
      });
      message.success(t("features-app.save-success"));
    } catch (error) {
      logger.error(error);
      message.error(t("features-app.save-error"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  return (
    <>
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
              <Form
                form={form}
                onFieldsChange={handleFieldsChange}
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
                  title={<Title level={4}>{t("features-noshow.no-show-config")}</Title>}
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
                  <div style={{ overflowY: "auto" }}>
                    <Row style={{ width: "100%" }}>
                      <Col span={24}>
                        <Typography.Title level={5}>{t("features-noshow.notice")}</Typography.Title>
                        <Typography.Paragraph
                          style={{ whiteSpace: "pre-line" }}
                          ellipsis={{
                            rows: 1,
                            expandable: "collapsible",
                          }}
                        >
                          {t("features-noshow.no-show-explanation")}
                        </Typography.Paragraph>
                      </Col>
                    </Row>
                    <MultiLineFormItem
                      label={t("features-noshow.no-show-config-type")}
                      name="type"
                      style={{ marginTop: "15px" }}
                    >
                      <Select style={{ width: "100%" }}>
                        {NO_SHOW_TYPES.map((item) => (
                          <Select.Option key={item.key} value={item.key}>
                            {item.value}
                          </Select.Option>
                        ))}
                      </Select>
                    </MultiLineFormItem>
                    {showConfig ? (
                      <>
                        <MultiLineFormItem
                          label={t("features-noshow.no-show-check-occupancy-type")}
                          name="checkOccupancyType"
                          style={{ marginTop: "15px" }}
                        >
                          <Select style={{ width: "100%" }}>
                            {CHECK_OCCUPANCY_TYPES.map((item) => (
                              <Select.Option key={item.key} value={item.key}>
                                {item.value}
                              </Select.Option>
                            ))}
                          </Select>
                        </MultiLineFormItem>
                        {checkOccupancyType === "ON_PERIOD" ? (
                          <MultiLineFormItem
                            label={t("features-noshow.no-show-check-occupancy-period")}
                            name="checkOccupancyPeriod"
                          >
                            <InputNumber
                              className="centered-input"
                              style={{ width: "250px" }}
                              addonAfter={"minutes"}
                              min={1}
                              max={15}
                            />
                          </MultiLineFormItem>
                        ) : null}
                        <MultiLineFormItem label={t("features-noshow.no-show-range-period")} name="actionRange">
                          <RangeTimePicker />
                        </MultiLineFormItem>
                        <MultiLineFormItem
                          label={t("features-noshow.no-show-maxResponseTime")}
                          name="maxResponseTime"
                        >
                          <InputNumber
                            className="centered-input"
                            style={{ width: "250px" }}
                            addonAfter={"minutes"}
                            min={5}
                            max={30}
                          />
                        </MultiLineFormItem>
                        <MultiLineFormItem
                          label={t("features-noshow.no-show-roomMaxDuration")}
                          name="roomMaxDuration"
                        >
                          <InputNumber
                            className="centered-input"
                            style={{ width: "250px" }}
                            addonAfter={"minutes"}
                            min={15}
                            max={8 * 60}
                          />
                        </MultiLineFormItem>
                        <MultiLineFormItem
                          label={t("features-noshow.no-show-isWhiteListEnabled")}
                          name="isWhiteListEnabled"
                          valuePropName="checked"
                        >
                          <Checkbox />
                        </MultiLineFormItem>
                        {showWhiteList ? (
                          <MultiLineFormItem label={t("features-noshow.no-show-whiteList")} name="whiteList">
                            <UserListSelect idField="email" />
                          </MultiLineFormItem>
                        ) : null}
                        <MultiLineFormItem label={t("features-noshow.no-show-VIP-list")} name="excludedGroups">
                          <GroupSelector mode="tags" size="middle" />
                        </MultiLineFormItem>
                        {templates > 1 ? (
                          <Col span={24} style={{ display: "flex", justifyContent: "center" }}>
                            <Typography.Title level={4}>
                              {t("features-noshow.no-show-email-template")}
                            </Typography.Title>
                          </Col>
                        ) : null}
                        <Form.Item
                          wrapperCol={{ span: 24, offset: 1 }}
                          name="releaseRoom_type_2"
                          hidden={templates !== 2}
                        >
                          <EmailTemplateEditor keywords={keywords} />
                        </Form.Item>
                        <Form.Item
                          wrapperCol={{ span: 24, offset: 1 }}
                          name="releaseRoom_type_3"
                          hidden={templates !== 3}
                        >
                          <EmailTemplateEditor keywords={keywords} />
                        </Form.Item>
                      </>
                    ) : null}
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

export default NoShowView;
