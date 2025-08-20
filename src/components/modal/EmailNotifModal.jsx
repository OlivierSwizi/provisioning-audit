/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect } from "react";
import { Modal, Form, Radio } from "antd";
import { useTranslation } from "react-i18next";
import EmailTemplateEditor from "../template-editors/EmailTemplateEditor";
import MultilangNotificationEditor from "../template-editors/MultilangNotificationEditor";

const EmailNotifModal = ({
  title = "",
  template,
  keywords,
  isVisible,
  setIsVisible,
  promiseResolve,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [editorType, setEditorType] = useState("pushNotification");

  useEffect(() => {
    if (template)
      form.setFieldsValue({
        pushNotification: template.pushNotification,
        email: { subject: template.subject, content: template.content },
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

  const handleOk = async () => {
    setIsVisible(false);
    const values = form.getFieldsValue();
    promiseResolve({
      pushNotification: values.pushNotification,
      subject: values.email.subject,
      content: values.email.content,
    });
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  return (
    <Modal
      open={isVisible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      width={1200}
      title={title}
      okButtonProps={{ style: { width: "180px" } }}
      cancelButtonProps={{ style: { width: "180px" } }}
      keywords={keywords}
    >
      <Radio.Group
        onChange={(e) => setEditorType(e.target.value)}
        value={editorType}
        style={{ marginBottom: "15px" }}
      >
        <Radio value={"email"}>{t("email")}</Radio>
        <Radio value={"pushNotification"}>{t("push-notification")}</Radio>
      </Radio.Group>

      <Form
        form={form}
        wrapperCol={{
          offset: 1,
          span: 22,
        }}
        layout="horizontal"
        colon={false}
        onFinish={handleOk}
      >
        <Form.Item
          label={null}
          hidden={editorType !== "pushNotification"}
          name="pushNotification"
          style={{ marginBottom: "0" }}
        >
          <MultilangNotificationEditor keywords={keywords} />
        </Form.Item>
        <Form.Item
          label={null}
          hidden={editorType !== "email"}
          name="email"
          style={{ marginBottom: "0" }}
        >
          <EmailTemplateEditor keywords={keywords} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EmailNotifModal;

export const useEmailNotifModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);
  const [template, setTemplate] = useState({});
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState([]);

  const updateTemplate = (title, template, keywords) => {
    setIsVisible(true);
    setTemplate(template);
    setTitle(title);
    setKeywords(keywords);

    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    updateTemplate,

    <EmailNotifModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      title={title}
      template={template}
      keywords={keywords}
    />,
  ];
};
