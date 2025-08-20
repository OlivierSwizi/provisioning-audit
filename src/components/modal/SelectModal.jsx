/* eslint-disable react-refresh/only-export-components */

import  { useState, useEffect } from "react";

import { Modal, Col, Row, Typography, Select } from "antd";

const SelectModal = ({
  options = [
    { value: "yes", label: "yes" },
    { value: "no", label: "no" },
  ],
  title = "",
  description = "",
  isVisible,
  setIsVisible,
  promiseResolve,
}) => {
  const [selected, setSelected] = useState();
  useEffect(() => {
    if (options && isVisible) {
      setSelected(options[0].value);
    }
     
  }, [options, isVisible]);

  const handleOk = async () => {
    setIsVisible(false);
    promiseResolve(selected);
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
          <Select onChange={(v) => setSelected(v)} options={options} />
        </Col>
      </Row>
    </Modal>
  );
};

export default SelectModal;

export const useSelectModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([]);
  const [promiseResolve, setPromiseResolve] = useState(null);

  const askSelect = (title, description, options) => {
    setIsVisible(true);
    setDescription(description);
    setTitle(title);
    setOptions(options);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    askSelect,
    // eslint-disable-next-line react/jsx-key 
    <SelectModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      options={options}
      title={title}
      description={description}
    />,
  ];
};
