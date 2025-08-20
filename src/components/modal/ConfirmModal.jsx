/* eslint-disable react-refresh/only-export-components */

import { Modal, Row, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { useState } from "react";

const ConfirmModal = ({ title = "", text = "", isVisible, setIsVisible, promiseResolve }) => {
  const handleOk = () => {
    setIsVisible(false);
    promiseResolve(true);
  };

  const handleCancel = () => {
    setIsVisible(false);
    promiseResolve(false);
  };

  return (
    <Modal
      open={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ style: { width: "180px" } }}
      cancelButtonProps={{ style: { width: "180px" } }}
    >
      <Row justify="center" style={{ marginBottom: "25px", display: "flex" }}>
        <ExclamationCircleOutlined
          style={{ fontSize: "40px", color: "#faad14", marginRight: "10px" }}
        />
        <Typography.Title level={4}>{title}</Typography.Title>
      </Row>
      {text.split("\n").map((line, idx) => (
        <Row key={idx}>
          <Typography.Text>{line}</Typography.Text>
        </Row>
      ))}
    </Modal>
  );
};

export default ConfirmModal;

export const useConfirmModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const prompt = (title, text) => {
    setIsVisible(true);
    setTitle(title);
    setText(text);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    prompt,

    <ConfirmModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      title={title}
      text={text}
    />,
  ];
};
