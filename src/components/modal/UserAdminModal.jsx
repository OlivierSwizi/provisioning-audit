/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect } from "react";

import { Modal, Typography, Form, Input } from "antd";
import { useTranslation } from "react-i18next";

const UserAdminModal = ({ isVisible, setIsVisible, promiseResolve }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isVisible) form.resetFields();
  }, [form, isVisible]);

  const handleOk = async () => {
    setIsVisible(false);
    promiseResolve(form.getFieldsValue());
  };

  const handleCancel = () => {
    setIsVisible(false);
    promiseResolve();
  };

  return (
    <Modal open={isVisible} onOk={form.submit} onCancel={handleCancel}>
      <Typography.Title level={4}>{t("components.add-user")}</Typography.Title>
      <Form form={form} autocomplete="off" onFinish={handleOk} layout="vertical">
        <Form.Item
          label="Nom"
          name="lastName"
          rules={[
            {
              required: true,
              message: t("components.required-field"),
            },
          ]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          label="Prénom"
          name="firstName"
          rules={[
            {
              required: true,
              message: t("components.required-field"),
            },
          ]}
        >
          <Input autoComplete="off" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              type: "email",
              message: t("components.incorrect-format"),
            },
          ]}
        >
          <Input autoComplete="off" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserAdminModal;

export const useUserAdminModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);

  const askUser = () => {
    setIsVisible(true);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    askUser,

    <UserAdminModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
    />,
  ];
};
