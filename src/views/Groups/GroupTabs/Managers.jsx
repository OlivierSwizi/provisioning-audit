import Glyph from "@/common/Glyph";
import { Button, Card, Col, Popconfirm, Row, Space, Tooltip, Typography } from "antd";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import useDesignTokens from "@/hook/useDesignTokens";
import helpers from "@/helpers";

import { useSelector } from "react-redux";

const Managers = ({ group, onAddManagers, onRemoveManagerFromGroup }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { colors } = useDesignTokens();
  const appId = useSelector((state) => state.apps.selectedApp.id);

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
      <Row gutter={[10, 10]}>
        <Col span={22}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t("managers-of-group")}
          </Typography.Title>
        </Col>

        <Col span={2}>
          <Button
            type="primary"
            style={{ float: "right", marginLeft: "auto" }}
            size="small"
            onClick={onAddManagers}
          >
            <Space size="small">
              <Glyph name={"add-person"} style={{ fontSize: "18px" }} />
              {t("add-manager")}
            </Space>
          </Button>
        </Col>
      </Row>
      <div style={{ flexGrow: 1, overflowY: "auto" }}>
        {group.managers.length === 0 ? (
          <Typography.Text style={{ textAlign: "center" }}>
            {t("no-manager-in-group")}
          </Typography.Text>
        ) : (
          <>
            {group.managers.map((manager) => {
              return (
                <Row key={manager.id}>
                  {}
                  <Col span={2}>
                    <Button disabled size="middle" shape="circle" type="dashed"></Button>
                  </Col>
                  <Col span={8}>{helpers.formatUserName(manager)}</Col>

                  <Col span={4}>
                    <Typography.Link
                      onClick={() => {
                        navigate(`/apps/${appId}/users/${manager.id}`);
                      }}
                    >
                      {t("check-user")}
                    </Typography.Link>
                  </Col>
                  <Col span={2}>
                    <Tooltip title={t("remove-manager-from-group")}>
                      <Popconfirm
                        title={t("remove-manager-from-group-confirmation", { groupName: "" })}
                        onConfirm={() => onRemoveManagerFromGroup(manager.id)}
                        placement="left"
                        okText={t("yes")}
                        cancelText={t("no")}
                      >
                        <Glyph
                          name="delete"
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
              );
            })}
          </>
        )}
      </div>
    </Card>
  );
};

export default Managers;
