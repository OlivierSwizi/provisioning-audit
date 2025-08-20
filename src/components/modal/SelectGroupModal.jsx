/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect } from "react";
import { Modal, Row, Typography } from "antd";
import GroupSelector from "../GroupSelector";
import { useTranslation } from "react-i18next";

const SelectGroupModal = ({
  isVisible,
  setIsVisible,
  excludedGroupIds,
  promiseResolve,
  excludeParent = true,
  onlyParent = false,
  includeGlobalGroups = false,
}) => {
  const [value, setValue] = useState();
  const { t } = useTranslation();

  useEffect(() => {
    if (isVisible) {
      setValue();
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
    <Modal open={isVisible} onOk={handleOk} onCancel={handleCancel}>
      <Row>
        <Typography.Title level={4}>{t("components.choose-group-to-move")}</Typography.Title>
      </Row>
      <Row>
        <Typography.Text>{t("components.manage-group-explaination")}</Typography.Text>
      </Row>
      <GroupSelector
        value={value}
        onChange={(g) => {
          setValue(g);
        }}
        style={{ width: "100%", marginTop: "25px" }}
        size="large"
        excludedGroupIds={excludedGroupIds}
        excludeParent={excludeParent}
        onlyParent={onlyParent}
        includeGlobalGroups={includeGlobalGroups}
      />
    </Modal>
  );
};

export default SelectGroupModal;

export const useSelectGroupModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);
  const [excludedGroupIds, setExcludedGroupIds] = useState([]);
  const [onlyParent, setOnlyParent] = useState(false);
  const [excludeParent, setExcludeParent] = useState(true);
  const [includeGlobalGroups, setIncludeGlobalGroups] = useState(false);

  const prompt = (
    excludedGroupIds,
    onlyParent = false,
    excludeParent = true,
    includeGlobalGroups = false,
  ) => {
    setIsVisible(true);
    setExcludedGroupIds(excludedGroupIds);
    setOnlyParent(onlyParent);
    setExcludeParent(excludeParent);
    setIncludeGlobalGroups(includeGlobalGroups);

    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    prompt,

    <SelectGroupModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      excludedGroupIds={excludedGroupIds}
      onlyParent={onlyParent}
      excludeParent={excludeParent}
      includeGlobalGroups={includeGlobalGroups}
    />,
  ];
};
