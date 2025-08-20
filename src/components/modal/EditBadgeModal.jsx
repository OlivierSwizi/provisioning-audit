/* eslint-disable react-refresh/only-export-components */

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import MultiLineFormItem from "@/components/MultiLineFormItem";
import { Modal, Form, Input, Button } from "antd";
import { useForm } from "antd/lib/form/Form";
import GroupSelector from "../GroupSelector";
import ZplEditor from "../ZplEditor";

const EditBadgeModal = ({ badge, isVisible, setIsVisible, promiseResolve }) => {
  const [form] = useForm();
  const { t } = useTranslation();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (isVisible) {
      form.setFieldsValue({
        title: badge.title,
        groupId: badge.groupId,
        template: badge.template,
        id: badge.id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleFieldsChange = () => {
    const { title, groupId, template } = form.getFieldsValue();
    setIsValid(!!(title && groupId && template));
  };

  const handleOk = () => {
    form.submit();
  };

  const handleFinish = (values) => {
    setIsVisible(false);
    promiseResolve({
      id: badge.id,
      title: values.title,
      groupId: values.groupId,
      template: values.template,
    });
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  return (
    <Modal
      style={{ minWidth: "50%" }}
      bodyStyle={{ height: "75vh" }}
      open={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="submit" type="primary" onClick={handleOk} disabled={!isValid}>
          {t("components.save")}
        </Button>,
      ]}
    >
      <Form
        form={form}
        onFieldsChange={handleFieldsChange}
        onFinish={handleFinish}
        labelCol={{
          span: 6,
        }}
        wrapperCol={{
          offset: 1,
          span: 14,
        }}
        layout="horizontal"
      >
        <MultiLineFormItem label={t("components.reception-badge-name")} name="title">
          <Input autoComplete="off" />
        </MultiLineFormItem>
        <MultiLineFormItem label={t("components.reception-badge-groupId")} name="groupId">
          <GroupSelector size="middle" />
        </MultiLineFormItem>
        <Form.Item name="template" label="" wrapperCol={{ span: 24 }}>
          <ZplEditor />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditBadgeModal;

export const useEditBadgeModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [badge, setBadge] = useState();
  const [promiseResolve, setPromiseResolve] = useState(null);

  const editBadge = (badgeToEdit) => {
    setIsVisible(true);
    setBadge(badgeToEdit);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    editBadge,
    <EditBadgeModal
      key="modal"
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      badge={badge}
    />,
  ];
};
