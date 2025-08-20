/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect } from "react";
import { Modal, Input, Form, Col, Row, Checkbox, message, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { API } from "@/services/features/AuthSlice";
import { useSelector } from "react-redux";
import logger from "@/logger";

const UserModal = ({ user = undefined, isVisible, setIsVisible, promiseResolve }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [isCreationForm, setIsCreationForm] = useState(false);
  const api = useSelector(API);

  useEffect(() => {
    if (user && isVisible) {
      form.setFieldsValue({
        email: user.email,
        login: user.login,
        brokerExtId: user.brokerExtId || "",
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        company: user.company || "",
        entity: user.entity || "",
        phone: user.phone || "",
        mobilePhone: user.mobilePhone || "",
        function: user.function || "",
        businessAddress: user.businessAddress || "",
        enabled: user.enabled,
        confidential: user.confidential || false,
      });
      setIsCreationForm(false);
    } else if (isVisible) {
      form.setFieldsValue({
        email: "",
        login: "",
        brokerExtId: "",
        firstname: "",
        lastname: "",
        company: "",
        entity: "",
        phone: "",
        mobilePhone: "",
        function: "",
        businessAddress: "",
        enabled: true,
        confidential: false,
      });
      setIsCreationForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isVisible]);

  const handleOk = async () => {
    if (isCreationForm) {
      // must check if login/email are valid
      try {
        const isValid = await api.users.checkValidity(
          form.getFieldValue("login"),
          form.getFieldValue("email"),
        );
        if (!isValid) {
          message.error(t("user-invalid-login-email"));
          return;
        }
      } catch (error) {
        logger.error("Failed to check user validity", error);
        message.error(t("an-error-occurred"));
        return;
      }
    }
    setIsVisible(false);
    promiseResolve(form.getFieldsValue());
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const Item = ({ label, name, disabled = false, required = false, isEmail }) => {
    const rules = [
      {
        required,
        message: t("required-field"),
      },
    ];

    if (isEmail) rules.push({ type: "email", message: t("invalid-email") });

    return (
      <Form.Item
        label={<div style={{ whiteSpace: "normal" }}>{t(label)}</div>}
        name={name}
        style={{ marginBottom: "0" }}
        rules={rules}
      >
        <Input autoComplete="off" size="small" disabled={disabled} />
      </Form.Item>
    );
  };

  return (
    <Modal
      open={isVisible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      width={1200}
      okButtonProps={{ style: { width: "180px" } }}
      cancelButtonProps={{ style: { width: "180px" } }}
    >
      <Form
        form={form}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          offset: 1,
          span: 14,
        }}
        layout="horizontal"
        colon={false}
        onFinish={handleOk}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Typography.Title level={4}>
              {user ? t("user-informations") : t("user-creation")}
            </Typography.Title>
          </Col>
          <Col span={12}>
            <Item
              label={t("user-login")}
              name={"login"}
              disabled={!isCreationForm}
              required={true}
            />
            <Item label={t("user-email")} name={"email"} required={true} isEmail={true} />
            <Item label={t("user-external-id")} name={"brokerExtId"} />
            <Item label={t("user-firstname")} name={"firstname"} required={true} />
            <Item label={t("user-lastname")} name={"lastname"} required={true} />
            <Item label={t("user-company")} name={"company"} />
          </Col>
          <Col span={12}>
            <Item label={t("user-entity")} name={"entity"} />
            <Item label={t("user-phone")} name={"phone"} />
            <Item label={t("user-mobile-phone")} name={"mobilePhone"} />
            <Item label={t("user-function")} name={"function"} />
            <Item label={t("user-business-address")} name={"businessAddress"} />
            <Form.Item
              label={<div style={{ whiteSpace: "normal" }}>{t("user-allow-access")}</div>}
              name={"enabled"}
              style={{ marginBottom: "0" }}
              valuePropName="checked"
            >
              <Checkbox size="small" />
            </Form.Item>
            <Form.Item
              label={<div style={{ whiteSpace: "normal" }}>{t("confidential-user")}</div>}
              name={"confidential"}
              style={{ marginBottom: "0" }}
              valuePropName="checked"
            >
              <Checkbox size="small" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UserModal;

export const useUserModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);
  const [user, setUser] = useState();

  const updateUser = (initialUser) => {
    setIsVisible(true);
    setUser(initialUser);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    updateUser,

    <UserModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      user={user}
    />,
  ];
};
