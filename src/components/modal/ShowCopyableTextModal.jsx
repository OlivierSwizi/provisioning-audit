/* eslint-disable react-refresh/only-export-components */

import  { useState,  } from "react";

import { Modal, Col, Row, Typography,  } from "antd";

const ShowCopyableTextModal = ({
  title = "",
  text = "",
  description = "",
  isVisible,
  setIsVisible,
  promiseResolve,
}) => {
  const handleOk = async () => {
    setIsVisible(false);
    promiseResolve();
  };

  const handleCancel = () => {
    setIsVisible(false);
    promiseResolve();
  };

  return (
    <Modal
      open={isVisible}
      onOk={handleOk}
      onCancel={handleCancel}
      //width={800}
      okButtonProps={{ style: { width: "180px" } }}
      cancelButtonProps={{ style: { width: "180px" } }}
      title={title}
    >
      <Row>
        <Col span={24}>
          <Typography.Text>{description}</Typography.Text>
        </Col>
        <Col span={24} style={{ marginTop: "24px" }}>
          <Typography.Text copyable>{text}</Typography.Text>
        </Col>
      </Row>
    </Modal>
  );
};

export default ShowCopyableTextModal;

export const useShowCopyableTextModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [text, setText] = useState("");
  const [promiseResolve, setPromiseResolve] = useState(null);

  const showCopyableText = (title, description, text) => {
    setIsVisible(true);
    setDescription(description);
    setTitle(title);
    setText(text);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    showCopyableText,
    // eslint-disable-next-line react/jsx-key
    <ShowCopyableTextModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      text={text}
      title={title}
      description={description}
    />,
  ];
};
