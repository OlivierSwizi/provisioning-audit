import { useTranslation } from "react-i18next";
import { Row, Col, Button, Input, message, Form, Typography } from "antd";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { API } from "@/services/features/AuthSlice";

import { startWorking, stopWorking } from "@/services/features/UISlice";
import { useForm } from "antd/lib/form/Form";

import logger from "@/logger";

const AppSettingsView = () => {
  const [form] = useForm();

  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!appId) return;

    const doIt = async () => {
      try {
        await dispatch(startWorking());
        const config = await api.features.listAppVersions();

        form.setFieldsValue({ items: config });
      } catch (e) {
        logger.error(e);
        message.error(t("audience.load-error"));
      } finally {
        await dispatch(stopWorking());
      }
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  const handleSave = async () => {
    try {
      await dispatch(startWorking());
      await api.features.updateAppVersions(form.getFieldsValue().items);
      message.success(t("features-app.save-success"));
    } catch (error) {
      logger.error(error);
      message.error(t("features-app.save-error"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  return (
    <Row style={{ marginTop: 20 }}>
      <Col span={24}>
        <Row style={{ width: "100%" }}>
          <Col span={20}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {t("features-app.mobile-apps-versions")}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ marginLeft: 10 }}>
              {t("features-app.mobile-apps-versions-description")}
            </Typography.Text>
          </Col>
          <Col span={4}>
            <Button block type="primary" onClick={handleSave}>
              {t("components.save")}
            </Button>
          </Col>
          <Col span={22} style={{ marginTop: "50px" }}>
            <Form
              className="multiline-label-form"
              form={form}
              onFinish={handleSave}
              labelCol={undefined}
              wrapperCol={undefined}
              layout="vertical"
            >
              <Form.List name="items" style={{ width: "100%", marginTop: 20 }}>
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Row key={key} gutter={16}>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, "bundleId"]}
                            label={t("features-app.bundle-id")}
                            rules={[{ required: true }]}
                          >
                            <Input autoComplete="off" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, "appVersion"]}
                            label={t("features-app.version")}
                          >
                            <Input autoComplete="off" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item {...restField} name={[name, "buildNumber"]} label={t("features-app.build")}>
                            <Input autoComplete="off" />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...restField}
                            name={[name, "description"]}
                            label={t("features-app.description")}
                          >
                            <Input autoComplete="off" />
                          </Form.Item>
                        </Col>
                        <Col span={4} style={{ marginTop: "30px" }}>
                          <Button onClick={() => remove(name)}>{t("components.remove")}</Button>
                        </Col>
                      </Row>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      style={{ width: 250, margin: "20px auto 0", display: "block" }}
                    >
                      {t("features-app.add-version")}
                    </Button>
                  </>
                )}
              </Form.List>
            </Form>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default AppSettingsView;
