import { useTranslation } from "react-i18next";
import {
  Row,
  Col,
  Typography,
  Button,
  Input,
  Divider,
  Card,
  Pagination,
  Checkbox,
  Select,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDebounce } from "use-debounce";
import { useWorkDispatch } from "@/services/features/UISlice";

import Glyph from "../../common/Glyph";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import useDesignTokens from "@/hook/useDesignTokens";
import { useSelectGroupModal } from "@/components/modal/SelectGroupModal";
import { useUserModal } from "@/components/modal/UserModal";
import logger from "@/logger";
import { enableUsers, searchUsers } from "@/services/features/UsersSlice";
import { createUser } from "@/services/features/UsersSlice";
import { addUsersToGroup } from "@/services/features/GroupsSlice";

const UsersView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workDispatch = useWorkDispatch();
  const { colors } = useDesignTokens();
  const [users, setUsers] = useState([]);
  const [selectGroup, SelectGroupModal] = useSelectGroupModal();
  const [askUserInfos, CreateUserModal] = useUserModal();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [total, setTotal] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const { appId } = useParams();

  const [filter, setFilter] = useState("");

  const [debouncedFilter] = useDebounce(filter, 500);

  const { access } = useSelector((state) => state.auth);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleRefresh = async (filterUpdated) => {
    const users = await workDispatch(searchUsers(filter, filterUpdated ? 1 : page, pageSize));
    setUsers(users.items);
    setTotal(users.total);
    if (filterUpdated) setPage(1);
  };

  useEffect(
    () =>
      setIsAdmin(
        access.all?.usersgroups === "admin" ||
          access[appId]?.usersgroups === "admin" ||
          access.superAdmin,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [access],
  );

  useEffect(() => {
    if (!appId) return;
    handleRefresh(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, debouncedFilter]);

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const UserList = () => (
    <>
      <section style={{ marginTop: "16px", padding: "10px 0" }}>
        <div
          style={{
            display: "grid",
            gridGap: "10px",
            gridTemplateColumns: "repeat(auto-fill, 380px)",
          }}
        >
          {users.map((item, idx) => (
            <Card
              key={idx}
              onClick={() => {
                navigate(`/apps/${appId}/users/${item.id}`);
              }}
              style={{
                cursor: "pointer",
                background: item.enabled ? colors.white_color : colors.grey_20,
              }}
              title={
                <div style={{ display: "flex", flexFlow: "column" }}>
                  <Typography.Text strong>
                    {isAdmin ? (
                      <Checkbox
                        key={`chk-select-user-${idx}`}
                        checked={selectedUsers.find((su) => su.id === item.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          const newSelectedUser = selectedUsers.filter((su) => su.id !== item.id);
                          if (e.target.checked) {
                            newSelectedUser.push(item);
                          }

                          setSelectedUsers(newSelectedUser);
                        }}
                        style={{
                          marginRight: "8px",
                          fontWeight: "normal",
                          color: colors.secondary_base,
                        }}
                      />
                    ) : (
                      <Glyph
                        style={{
                          marginRight: "8px",
                          verticalAlign: "-4px",
                          fontWeight: "normal",
                          color: colors.secondary_base,
                        }}
                        name="person"
                      />
                    )}
                    {item.lastname}
                  </Typography.Text>
                  <Typography.Text style={{ marginLeft: "32px" }}>{item.firstname}</Typography.Text>
                </div>
              }
              extra={
                <Typography.Text copyable style={{ fontSize: "12px" }}>
                  {item.id}
                </Typography.Text>
              }
              bordered={false}
            >
              <Typography.Paragraph style={{ marginBottom: "0", fontSize: "14px" }}>
                <Glyph name="email" style={{ verticalAlign: "-4px", marginRight: "8px" }} />
                {item.email}
              </Typography.Paragraph>
            </Card>
          ))}
        </div>
      </section>
      <Row style={{ marginTop: "30px", justifyContent: "center" }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          pageSizeOptions={["9", "18", "27"]}
          showSizeChanger
        />
      </Row>
    </>
  );

  const handleCreateUser = async () => {
    let user = await askUserInfos();
    try {
      await workDispatch(createUser(user));
      message.success(t("users.user-created"));
    } catch (error) {
      message.error(t("audience.error-occurred"));
      logger.log(error);
    }
  };

  const handleMoveToGroup = async () => {
    const groupId = await selectGroup();
    if (groupId) {
      try {
        workDispatch(
          addUsersToGroup(
            groupId,
            selectedUsers.map((su) => su.id),
          ),
        );
        message.success(t("groups.users-added-to-group"));
      } catch (e) {
        logger.error("error during move to group", e);
        message.error(t("audience.error-occurred"));
      }
    }
  };

  const handleEnableUsers = async (enable) => {
    try {
      await workDispatch(
        enableUsers(
          selectedUsers.map((su) => su.id),
          enable,
        ),
      );
      enable ? message.success(t("users.users-enabled")) : message.success(t("users.users-disabled"));
    } catch (error) {
      message.error(t("audience.error-occurred"));
      logger.log(error);
    }
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case "add-user":
        handleCreateUser();
        break;
      case "disable-user":
        handleEnableUsers(false);
        break;
      case "enable-user":
        handleEnableUsers(true);
        break;
      case "move-to-group":
        handleMoveToGroup();
        break;
      default:
        break;
    }
  };

  const actionsMenu = [
    { label: t("calendars.actions"), value: "actions" },
    { label: t("components.add-user"), value: "add-user", disabled: selectedUsers.length > 0 },
    {
      label: selectedUsers.length > 1 ? t("users.disable-users") : t("users.disable-user"),
      value: "disable-user",
      disabled: selectedUsers.length === 0,
    },
    {
      label: selectedUsers.length > 1 ? t("users.enable-users") : t("users.enable-user"),
      value: "enable-user",
      disabled: selectedUsers.length === 0,
    },
    { label: t("users.move-to-group"), value: "move-to-group", disabled: selectedUsers.length === 0 },
  ];

  return (
    <>
      {SelectGroupModal}
      {CreateUserModal}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Row style={{ marginBottom: "15px" }}>
            <Col span={18}>
              <Typography.Title level={3}>{t("groups.users")}</Typography.Title>
            </Col>
          </Row>
          <Row>
            <Col span={20}>
              <Input
                size="large"
                allowClear
                onChange={(e) => {
                  setFilter(e.target.value);
                }}
                prefix={<SearchOutlined />}
                placeholder={t("components.search-user")}
                addonAfter={
                  <Glyph name={"refresh"} style={{ cursor: "pointer" }} onClick={handleRefresh} />
                }
                value={filter}
              />
            </Col>
          </Row>
          <Divider type="horizontal" />
          {isAdmin ? (
            <Row>
              <Col span={4}>
                <Button
                  block
                  disabled={users.length === 0}
                  onClick={() => {
                    setSelectedUsers(users);
                  }}
                >
                  {t("calendars.select-all")}
                </Button>
              </Col>
              <Col span={4} offset={1}>
                <Button
                  block
                  disabled={selectedUsers.length === 0}
                  onClick={() => {
                    setSelectedUsers([]);
                  }}
                >
                  {t("calendars.unselect-all")}
                </Button>
              </Col>
              <Col span={4} offset={1}>
                <Select
                  options={actionsMenu}
                  value={"actions"}
                  style={{ width: "250px" }}
                  onSelect={handleMenuAction}
                />
              </Col>
            </Row>
          ) : null}
          <Row>
            <Col span={24}>
              <UserList />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default UsersView;
