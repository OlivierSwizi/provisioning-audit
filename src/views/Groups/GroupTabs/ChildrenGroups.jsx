import Glyph from "@/common/Glyph";
import {
  Button,
  Card,
  Col,
  Popconfirm,
  Row,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useWorkDispatch } from "@/services/features/UISlice";
import useDesignTokens from "@/hook/useDesignTokens";
import { useSelectGroupModal } from "@/components/modal/SelectGroupModal";

import { API } from "@/services/features/AuthSlice";

import logger from "@/logger";
import NetworkTypeTag from "@/components/NetworkTypeTag";
import GroupTypeGlyph from "@/components/GroupTypeGlyph";

const ChildrenGroups = ({ group }) => {
  const { t } = useTranslation();
  const workDispatch = useWorkDispatch();
  const navigate = useNavigate();

  const api = useSelector(API);

  const { colors } = useDesignTokens();
  const { selectedApp } = useSelector((state) => state.apps);

  const [selectGroup, SelectGroupModal] = useSelectGroupModal();

  const [children, setChildren] = useState([]);

  const loadChildren = () => {
    workDispatch(async () => {
      const result = await api.groups.listChildren(group.id);
      setChildren(result);
    });
  };

  const handleAddChildren = async () => {
    const g = await selectGroup(
      [...children.map((child) => child.id), group.id],
      false,
      false,
      true,
    );
    if (g) {
      await workDispatch(async () => {
        try {
          await api.groups.addChildren(group.id, [g]);
        } catch (error) {
          logger.error(error);
          message.error(t("audience.error-occurred"));
        }
      });
      loadChildren();
    }
  };

  useEffect(() => {
    if (group) loadChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  const handleRemoveChildrenFromGroup = async (child) => {
    await workDispatch(async () => {
      try {
        await api.groups.removeChildren(group.id, child.id);
      } catch (error) {
        logger.error(error);
        message.error(t("audience.error-occurred"));
      }
    });
    loadChildren();
  };

  const handleMoveToGroup = (id) => {
    navigate(`/apps/${selectedApp.id}/groups/${id}`);
  };
  if (!group) return null;
  return (
    <Card
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      bordered={false}
    >
      {SelectGroupModal}
      <Row gutter={[10, 10]}>
        <Col span={19}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t("groups.children-of-group")}
          </Typography.Title>
        </Col>

        <Col span={5}>
          <Button
            type="primary"
            style={{
              float: "right",
              marginLeft: "auto",
              whiteSpace: "normal",
              fontWeight: "normal",
              height: "auto",
            }}
            size="small"
            onClick={handleAddChildren}
            block
          >
            {t("groups.add-children")}
          </Button>
        </Col>

        {(children || []).map((child, idx) => (
          <Row key={idx} style={{ height: "35px", width: "100%" }}>
            <Col span={10}>
              <Space size="middle">
                <GroupTypeGlyph group={child} />

                <span style={{ display: "flex" }}>
                  <Typography.Text
                    style={{ color: colors.grey_60, marginRight: "15px", marginTop: "5px" }}
                  >
                    {child.label}
                  </Typography.Text>
                  <NetworkTypeTag type={child.type} />
                </span>
              </Space>
            </Col>
            <Col span={6}>
              <Glyph name="person" style={{ fontSize: "24px", color: colors.grey_60 }} />
              {child.nb_users} {t("groups.users")}
            </Col>
            <Col span={5}>
              <Typography.Link onClick={() => handleMoveToGroup(child.id)}>
                {t("groups.check-group")}
              </Typography.Link>
            </Col>
            <Col span={3}>
              <Tooltip title={t("groups.remove_from_group")}>
                <Popconfirm
                  title={t("groups.remove-from-group-children", { groupName: child.label })}
                  onConfirm={() => handleRemoveChildrenFromGroup(child)}
                  placement="left"
                  okText={t("flexoffice.yes")}
                  cancelText={t("flexoffice.no")}
                >
                  <Glyph
                    name="delete_forever"
                    style={{
                      fontSize: "18px",
                      color: colors.highlight_light,
                      cursor: "pointer",
                    }}
                  />
                </Popconfirm>
              </Tooltip>
            </Col>
          </Row>
        ))}
      </Row>
    </Card>
  );
};

export default ChildrenGroups;
