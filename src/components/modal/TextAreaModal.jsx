/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect } from "react";

import { Modal, Form, Col, Row } from "antd";

import TextArea from "antd/lib/input/TextArea";

const TextAreaModal = ({ document, title, isVisible, setIsVisible, promiseResolve }) => {
  const [form] = Form.useForm();
  const [_, setIsCreationForm] = useState(false);

  useEffect(() => {
    if (document && isVisible) {
      form.setFieldsValue({
        document,
      });
      setIsCreationForm(false);
    } else if (isVisible) {
      form.setFieldsValue({
        document: "",
      });
      setIsCreationForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, isVisible]);

  const handleOk = async () => {
    setIsVisible(false);
    promiseResolve(form.getFieldValue("document"));
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  return (
    <Modal
      open={isVisible}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      width={800}
      okButtonProps={{ style: { width: "180px" } }}
      cancelButtonProps={{ style: { width: "180px" } }}
      title={title}
    >
      <Form
        form={form}
        labelCol={{
          span: 2,
        }}
        layout="horizontal"
        colon={false}
        onFinish={handleOk}
      >
        <Row>
          <Col span={24}>
            <Form.Item name={"document"} style={{ marginBottom: "0" }}>
              <TextArea autoSize={{ minRows: 15 }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TextAreaModal;

export const useTextAreaModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [promiseResolve, setPromiseResolve] = useState(null);
  const [document, setDocument] = useState();

  const editText = (title, document) => {
    setIsVisible(true);
    setDocument(document);
    setTitle(title);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    editText,

    <TextAreaModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      document={document}
      title={title}
    />,
  ];
};
