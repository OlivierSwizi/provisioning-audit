import { Col, Input, Modal, Row } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEditBadgeModal } from "@/components/modal/EditBadgeModal";

import ManagedList from "./ManagedList";
import GroupLabel from "./GroupLabel";

const ReceptionBadgeList = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [badgeTemplates, setBadgesTemplate] = useState(value || []);
  const [editBadge, EditBadgeModal] = useEditBadgeModal();

  useEffect(() => {
    setBadgesTemplate((value || []).map((b, idx) => ({ ...b, id: idx })));
  }, [value]);

  const handleChange = (newBadges) => {
    setBadgesTemplate(newBadges);
    if (onChange) onChange(newBadges);
  };

  const handleAddBadge = async (v) => {
    const newBadge = await editBadge({
      title: v,
      template: "",
      groupId: undefined,
      id: badgeTemplates.length,
    });
    if (newBadge) {
      handleChange([...badgeTemplates, newBadge]);
    }
  };

  const handleRemoveBadge = (badge) => {
    Modal.confirm({
      title: t("reception-remove-badge"),
      content: t("reception-remove-badge-confirm"),
      onOk: () => handleChange(badgeTemplates.filter((b) => b.id !== badge.id)),
    });
  };

  const handleEditBadge = async (badge) => {
    const newBadge = await editBadge({
      title: badge.title,
      template: badge.template,
      groupId: badge.groupId,
    });
    if (newBadge) {
      handleChange(badgeTemplates.map((b) => (b.id === badge.id ? newBadge : b)));
    }
  };

  return (
    <Row style={{ width: "100%" }}>
      {EditBadgeModal}
      <Col span={24}>
        <ManagedList
          accordion
          title={`${t("reception-badge-list")}`}
          items={badgeTemplates}
          onAdd={handleAddBadge}
          onRemove={handleRemoveBadge}
          onEdit={handleEditBadge}
          addTitleKey="reception-add-badge"
          chooseNameKey="reception-choose-badge-name"
          cell={(badge) => (
            <Row width="100%">
              <Col span={8}>
                <GroupLabel value={badge.groupId} disabled />
              </Col>
              <Col span={16}>
                <Input autoComplete="off" value={badge.template} disabled />
              </Col>
            </Row>
          )}
        />
      </Col>
    </Row>
  );
};

export default ReceptionBadgeList;
