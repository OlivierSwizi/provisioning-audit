import { useTranslation } from "react-i18next";
import { Row, Col, Button, Input, message, Form, Checkbox, Tabs, Modal, InputNumber } from "antd";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";
import SiteSelector from "@/components/SiteSelector";

import { startWorking, stopWorking } from "@/services/features/UISlice";
import { useForm } from "antd/lib/form/Form";
import MultiLineFormItem from "@/components/MultiLineFormItem";
import ReceptionBadgeList from "@/components/ReceptionBadgeList";
import TemplateListEditor from "@/components/TemplateListEditor";
import GroupSelector from "@/components/GroupSelector";
import logger from "@/logger";

const keywords = [
  "webMailUrl",
  "resident.firstname",
  "resident.lastname",
  "qrcode",
  "resetPasswordUrl",
  "#unless visitor.verified",
  "/unless",
  "#if updatePasswordUrl",
  "updatePasswordUrl",
  "/if",
  "visitor.firstname",
  "visitor.lastname",
  "date",
  "hour",
];

const { TabPane } = Tabs;

const ReceptionView = () => {
  const [form] = useForm();

  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const dispatch = useDispatch();

  const [siteId, setSiteId] = useState(null);
  const [disablePrinter, setDisablePrinter] = useState(false);

  const verifyTemplateEntry = (entry, value) => {
    if (!value[entry]) {
      value[entry] = { subject: "", content: "" };
    }
  };

  useEffect(() => {
    if (!appId || !siteId) return;

    const doIt = async () => {
      try {
        await dispatch(startWorking());

        const config = await api.features.getReceptionConfig(siteId);
        delete config.mailTemplate[null];

        verifyTemplateEntry("mailCreate", config.mailTemplate);
        verifyTemplateEntry("mailDelete", config.mailTemplate);
        verifyTemplateEntry("mailUpdate", config.mailTemplate);
        verifyTemplateEntry("mailResidentCreate", config.mailTemplate);
        verifyTemplateEntry("mailResidentDelete", config.mailTemplate);
        verifyTemplateEntry("mailResidentUpdate", config.mailTemplate);

        form.setFieldsValue({
          appName: config.appName,
          printerIp: config.printerIp,
          allowBadgeLost: config.allowBadgeLost,
          badgeTemplates: config.badgeTemplates,
          mailTemplate: config.mailTemplate,
          useKeyCard: !!config.useKeyCard,
          disablePrinter: !!config.disablePrinter,
          maxVisitDuration: config.maxVisitDuration || 1,
          visitorGroups: config.visitorGroups || [],
        });

        setDisablePrinter(!!config.disablePrinter);
      } catch (e) {
        logger.error(e);
        message.error(t("load-scim-history--error"));
      } finally {
        await dispatch(stopWorking());
      }
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, siteId]);

  const handleSave = async () => {
    try {
      await dispatch(startWorking());
      await api.features.saveReceptionConfig(siteId, form.getFieldsValue());
      message.success(t("save-success"));
    } catch (error) {
      logger.error(error);
      message.error(t("save-error"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  const handleFieldsChange = (changedFields) => {
    if (changedFields[0].name[0] === "disablePrinter") {
      setDisablePrinter(changedFields[0].value);
      if (changedFields[0].value) {
        form.setFieldsValue({ useKeyCard: true });
        Modal.warn({
          title: t("printer-disabled"),
          content: t("printer-disabled-warning"),
        });
      }
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
            <Col span={4}>
              <Button block type="primary" onClick={handleSave}>
                {t("save")}
              </Button>
            </Col>
            <Col span={24}>
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
                onFieldsChange={handleFieldsChange}
              >
                <MultiLineFormItem label={t("visitor-group-list")} name="visitorGroups">
                  <GroupSelector mode="tags" size="middle" />
                </MultiLineFormItem>
                <MultiLineFormItem label={t("appname-reception")} name="appName">
                  <Input autoComplete="off" />
                </MultiLineFormItem>
                <MultiLineFormItem
                  label={t("disable-printer")}
                  name="disablePrinter"
                  valuePropName="checked"
                >
                  <Checkbox />
                </MultiLineFormItem>
                <MultiLineFormItem
                  label={t("default-ip-address")}
                  name="printerIp"
                  hidden={disablePrinter}
                >
                  <Input autoComplete="off" />
                </MultiLineFormItem>
                <Row style={{ width: "100%" }}>
                  <Col span={12}>
                    <MultiLineFormItem
                      label={t("allow-residents-badges")}
                      name="allowBadgeLost"
                      valuePropName="checked"
                    >
                      <Checkbox />
                    </MultiLineFormItem>
                  </Col>
                  <Col span={12}>
                    <MultiLineFormItem
                      label={t("allow-keycard")}
                      name="useKeyCard"
                      valuePropName="checked"
                    >
                      <Checkbox disabled={disablePrinter} />
                    </MultiLineFormItem>
                  </Col>
                  <Col span={12}>
                    <MultiLineFormItem label={t("max-duration-visit")} name="maxVisitDuration">
                      <InputNumber step={1} />
                    </MultiLineFormItem>
                  </Col>
                </Row>
                <Tabs defaultActiveKey="1">
                  {!disablePrinter && (
                    <TabPane tab={t("badges")} key="1">
                      <Form.Item name="badgeTemplates" wrapperCol={{ span: 24 }}>
                        <ReceptionBadgeList />
                      </Form.Item>
                    </TabPane>
                  )}

                  <TabPane tab={t("email-templates")} key="2">
                    <Form.Item name="mailTemplate" wrapperCol={{ span: 24 }}>
                      <TemplateListEditor keywords={keywords} />
                    </Form.Item>
                  </TabPane>
                </Tabs>
              </Form>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default ReceptionView;
