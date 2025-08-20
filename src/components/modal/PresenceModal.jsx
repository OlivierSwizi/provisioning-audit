/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect } from "react";
import { Modal, Input, Form, Col, Row, Checkbox, Typography } from "antd";
import { useTranslation } from "react-i18next";
import SiteSelector from "../SiteSelector";

import DateTime from "../DateTimePicker";
import dayjs from "dayjs";

const LABEL_MAX_WIDTH = "150px";

const PresenceModal = ({ isVisible, setIsVisible, promiseResolve }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const [showIsPresent, setShowIsPresent] = useState(false);

  const handleOk = async () => {
    promiseResolve({
      accessCode: form.getFieldValue("accessCode"),
      expiresAt: form.getFieldValue("expiresAt").toISOString(),
      isPresent: form.getFieldValue("isPresent"),
      presenceExpirationDate: form.getFieldValue("isPresent")
        ? form.getFieldValue("presenceExpirationDate").toISOString()
        : null,
      siteId: form.getFieldValue("site"),
    });
    setIsVisible(false);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    form.setFieldsValue({
      accessCode: "",
      expiresAt: dayjs().add(1, "day"),
      isPresent: false,
      presenceExpirationDate: dayjs().add(1, "day"),
    });
    setShowIsPresent(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleValuesChange = (changedFields) => {
    if (changedFields.isPresent !== undefined) {
      setShowIsPresent(changedFields.isPresent);
    }
  };

  return (
    <Modal
      open={isVisible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      width={500}
      okButtonProps={{ style: { width: "180px" } }}
      cancelButtonProps={{ style: { width: "180px" } }}
    >
      <Typography.Title level={4}>{t("add-presence")}</Typography.Title>
      <Form
        form={form}
        layout="horizontal"
        colon={false}
        onFinish={handleOk}
        onValuesChange={handleValuesChange}
      >
        <Row style={{ width: "100%", position: "relative" }}>
          <Col span={24}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("site")}</div>}
              name={"site"}
              style={{ marginBottom: "0", width: "100%" }}
              rules={[
                {
                  required: true,
                  message: t("required-field"),
                },
              ]}
            >
              <SiteSelector />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ width: "100%", position: "relative" }}>
          <Col span={24}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("access-code")}</div>}
              name={"accessCode"}
              style={{ marginBottom: "0", width: "100%" }}
              rules={[
                {
                  required: true,
                  message: t("required-field"),
                },
              ]}
            >
              <Input autoComplete="off" size="small" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ width: "100%", position: "relative" }}>
          <Col span={24}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("access-code-expiration-date")}</div>}
              name={"expiresAt"}
              style={{ marginBottom: "0", width: "100%" }}
            >
              <DateTime />
            </Form.Item>
          </Col>
        </Row>
        <Row style={{ width: "100%", position: "relative" }}>
          <Col span={24}>
            <Form.Item
              labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
              label={<div style={{ whiteSpace: "normal" }}>{t("is-present")}</div>}
              name={"isPresent"}
              valuePropName="checked"
              style={{ marginBottom: "0", width: "100%" }}
            >
              <Checkbox size="small" />
            </Form.Item>
          </Col>
        </Row>
        {showIsPresent && (
          <Row style={{ width: "100%", position: "relative" }}>
            <Col span={24}>
              <Form.Item
                labelCol={{ style: { width: LABEL_MAX_WIDTH } }}
                label={<div style={{ whiteSpace: "normal" }}>{t("presence-expiration-date")}</div>}
                name={"presenceExpirationDate"}
                style={{ marginBottom: "0", width: "100%" }}
              >
                <DateTime />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};

export default PresenceModal;

export const usePresenceModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);

  const updateUser = () => {
    setIsVisible(true);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    updateUser,

    <PresenceModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
    />,
  ];
};
