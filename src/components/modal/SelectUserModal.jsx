/* eslint-disable react-refresh/only-export-components */

import  { useState, useEffect } from "react";
import { Modal, Row, Typography } from "antd";
import { useTranslation } from "react-i18next";
import UserListSelect from "../UserListSelect";

const SelectUserModal = ({ isVisible, setIsVisible, promiseResolve }) => {
  const [value, setValue] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (isVisible) {
      setValue("");
    }
  }, [isVisible]);

  const handleOk = () => {
    setIsVisible(false);
    promiseResolve(value);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  return (
    <Modal open={isVisible} onOk={handleOk} onCancel={handleCancel} style={{ height: "500px" }}>
      <Row>
        <Typography.Title level={4}>{t("choose-users")}</Typography.Title>
      </Row>
      <Row style={{ width: "100%" }}>
        <UserListSelect
          style={{ width: "100%", marginTop: "25px", height: "300px" }}
          userListStyle={{ height: "300px" }}
          size="large"
          value={value}
          onChange={(value) => setValue(value)}
        />
      </Row>
    </Modal>
  );
};

export default SelectUserModal;

export const useSelectUserModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);

  const selectUsers = () => {
    setIsVisible(true);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    selectUsers,
    // eslint-disable-next-line react/jsx-key
    <SelectUserModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
    />,
  ];
};
