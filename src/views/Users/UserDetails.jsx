import {
  Row,
  Col,
  Button,
  Space,
  Card,
  Typography,
  Tabs,
  Table,
  Avatar,
  Image,
  Tooltip,
  message,
  Popconfirm,
  Flex,
} from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Glyph from "../../common/Glyph";
import { useState } from "react";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import * as R from "ramda";

import { useEffect } from "react";

import useDesignTokens from "../../hook/useDesignTokens";
import { useWorkDispatch } from "../../services/features/UISlice";

import { useUserModal } from "@/components/modal/UserModal";
import { useConfirmModal } from "@/components/modal/ConfirmModal";
import NetworkTypeTag from "@/components/NetworkTypeTag";
import { useSelectGroupModal } from "@/components/modal/SelectGroupModal";
import { usePresenceModal } from "@/components/modal/PresenceModal";
import logger from "@/logger";
import {
  getUser,
  removeSelectedUserFromGroup,
  removeUserAccess,
  updateUserAccess,
  updateUserDetails,
} from "@/services/features/UsersSlice";
import { addUsersToGroup } from "@/services/features/GroupsSlice";

const { Text } = Typography;

const UserDetails = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { t } = useTranslation();
  const { colors } = useDesignTokens();
  const workDispatch = useWorkDispatch();
  const [updateUser, UserModal] = useUserModal();
  const [confirm, ConfirmModal] = useConfirmModal();
  const [selectGroup, SelectGroupModal] = useSelectGroupModal();
  const [addPresence, PresenceModal] = usePresenceModal();

  const { selectedApp, siteList } = useSelector((state) => state.apps);

  const [user, setUser] = useState(null);

  const BoldTitle = ({ title }) => (
    <span style={{ textAlign: "center", fontWeight: "bold" }}>{title}</span>
  );

  const accessColumns = [
    {
      title: <BoldTitle title={t("site")} />,
      dataIndex: "siteName",
      key: "siteName",
      width: 200,
      align: "center",
    },
    {
      title: <BoldTitle title={t("access-code")} />,
      dataIndex: "accessCode",
      key: "accessCode",
      width: 300,
      align: "center",
      render: (accessCode) => (accessCode ? <Text copyable>{accessCode}</Text> : <Text>-</Text>),
    },
    {
      title: <BoldTitle title={t("access-code-expiration-date")} />,
      dataIndex: "expiresAt",
      key: "expiresAt",
      width: 200,
      align: "center",
      render: (v) => <Text>{v ? dayjs(v).format(t("date-hour-format")) : "-"}</Text>,
    },
    {
      title: <BoldTitle title={t("is-present")} />,
      dataIndex: "is-present",
      key: "isPresent",
      width: 100,
      align: "center",
      render: (v, d) => <Text>{d.isPresent ? t("yes") : t("no")}</Text>,
    },
    {
      title: <BoldTitle title={t("presence-expiration-date")} />,
      dataIndex: "presence-expiration-date",
      key: "presence-expiration-date",
      width: 200,
      align: "center",
      render: (v, d) => (
        <Text>
          {d.presenceExpiration ? dayjs(d.presenceExpiration).format(t("date-hour-format")) : "-"}
        </Text>
      ),
    },
    {
      title: "",
      dataIndex: "presence-remove",
      key: "presence-remove",
      width: 25,
      align: "center",
      render: (v, d) => (
        <Popconfirm
          title={t("remove-access-confirmation", { groupName: "" })}
          onConfirm={() => handleRemoveAccess(d)}
          placement="left"
          okText={t("yes")}
          cancelText={t("no")}
        >
          <Glyph
            name={"delete_forever"}
            style={{
              fontSize: "18px",
              color: colors.highlight_light,
              cursor: "pointer",
            }}
          />
        </Popconfirm>
      ),
    },
  ];

  const [noPhoto, setNoPhoto] = useState(false);

  const loadUser = async (userId) => {
    workDispatch(async () => {
      const user = await workDispatch(getUser(userId));
      setUser(user);
    });
  };

  const handleMoveToGroup = (id) => {
    navigate(`/apps/${selectedApp.id}/groups/${id}`);
  };

  const handleAddAccess = async () => {
    let access = await addPresence();
    if (access) {
      try {
        await workDispatch(
          updateUserAccess(
            user.id,
            access.siteId,
            access.accessCode,
            access.expiresAt,
            access.isPresent,
            access.presenceExpirationDate,
          ),
        );
        message.success(t("access-added-success"));
      } catch (error) {
        logger.error(error);
        message.error(t("access-added-error"));
      }
      loadUser(user.id);
    }
  };

  const handleRemoveAccess = async (access) => {
    try {
      await workDispatch(removeUserAccess(user.id, access.siteId));
      message.success(t("access-remove-success"));
    } catch (error) {
      logger.error(error);
      message.error(t("access-remove-error"));
    }
    loadUser(user.id);
  };

  const handleSelectUser = async (userId) => {
    loadUser(userId);
  };

  const handleUpdateUser = async () => {
    if (
      user.fromNetwork !== "SWIZI" &&
      !(await confirm(t("sync-origin-user"), t("update-sync-user-confirmation")))
    )
      return;
    try {
      const userInfo = await updateUser(user);
      await workDispatch(updateUserDetails(user.id, userInfo));
      message.success(t("user-update-success"));
    } catch (error) {
      logger.error(error);
      message.error(t("user-update-error"));
    }

    loadUser(user.id);
  };

  const handleRemoveFromGroup = async (group) => {
    try {
      await workDispatch(removeSelectedUserFromGroup(group.id, user.id));
      message.success(t("group-remove-user-success"));
    } catch (error) {
      logger.error(error);
      message.error(t("group-remove-user-error"));
    }
    loadUser(user.id);
  };

  const handleAddGroup = async () => {
    let groupId = await selectGroup(
      user.fullGroups.map((g) => g.id),
      false,
      false,
    );
    if (groupId) {
      try {
        await workDispatch(addUsersToGroup({ id: groupId }, [user.id]));
        message.success(t("group-add-user-success"));
      } catch (error) {
        logger.error(error);
        message.error(t("group-add-user-error"));
      }
      loadUser(user.id);
    }
  };

  useEffect(() => {
    if (!userId) return;
    handleSelectUser(userId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const UserDetail = ({ title, value, copyable = false }) => (
    <Row>
      <Col span={9}>
        <Typography.Text>{title + " :"}</Typography.Text>
      </Col>
      <Col offset={1} span={14}>
        <Typography.Text style={{ textAlign: "left" }} copyable={copyable}>
          {value}
        </Typography.Text>
      </Col>
    </Row>
  );

  const SiteAccess = () => (
    <>
      <Row style={{ width: "100%", marginBottom: "15px" }}>
        <Col span={24} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Button
            type="primary"
            style={{ float: "right", marginLeft: "auto" }}
            size="small"
            onClick={handleAddAccess}
          >
            <Space size="small">
              <Glyph name={"fingerprint"} style={{ fontSize: "18px" }} />
              {t("add-access")}
            </Space>
          </Button>
        </Col>
      </Row>
      <Row style={{ width: "100%" }}>
        <Table dataSource={user.access} columns={accessColumns} pagination={false} />
      </Row>
    </>
  );

  const UserInfos = () => (
    <>
      <Row style={{ width: "100%" }}>
        <Col span={12} style={{ borderRight: "1px solid #DDDDDD" }}>
          <UserDetail title={t("user-email")} value={user.email} />
          <UserDetail title={t("user-login")} value={user.login} />
          <UserDetail title={t("user-external-id")} value={user.brokerExtId} />
          <UserDetail title={t("user-firstname")} value={user.firstname} />
          <UserDetail title={t("user-lastname")} value={user.lastname} />
          <UserDetail title={t("user-company")} value={user.company} />
          <UserDetail title={t("user-entity")} value={user.entity} />
          <UserDetail title={t("user-phone")} value={user?.phone || ""} />
          <UserDetail title={t("user-mobile-phone")} value={user?.mobilePhone || ""} />
        </Col>

        <Col offset={1} span={11}>
          <UserDetail title={t("user-function")} value={user?.function || ""} />
          <UserDetail title={t("user-business-address")} value={user?.businessAddress || ""} />
          <UserDetail
            title={t("confidential-user")}
            value={user?.confidential ? t("yes") : t("no")}
          />

          <UserDetail title={t("user-allow-access")} value={user?.enabled ? t("yes") : t("no")} />
          <UserDetail
            title={t("user-photo-update-date")}
            value={user?.photo_date ? dayjs(user?.photo_date).format("DD/MM/YY") : t("never")}
          />
          <UserDetail
            title={t("user-origin")}
            value={user?.isManaged ? t("user-api-origin") : "Swizi"}
          />
          <UserDetail
            title={t("user-cgu-read")}
            value={user?.cguReadAt ? dayjs(user?.cguReadAt).format("DD/MM/YY") : t("never")}
          />
          <UserDetail
            title={t("user-campus")}
            value={user?.siteId ? siteList.find((s) => s.id === user.siteId)?.label : t("none")}
          />
        </Col>
      </Row>
      <Row style={{ width: "100%", marginTop: "25px" }}>
        <Col span={4} offset={10}>
          <Button block onClick={handleUpdateUser}>
            {t("modify")}
          </Button>
        </Col>
      </Row>
    </>
  );

  return user ? (
    <>
      {ConfirmModal}
      {UserModal}
      {SelectGroupModal}
      {PresenceModal}
      <Flex vertical="true" gap="small" style={{ width: "100%" }}>
        <Flex vertical="false">
          <Button type="text" onClick={() => navigate(-1)} icon={<LeftOutlined />}></Button>
        </Flex>

        <Flex
          vertical
          gap="middle"
          style={{
            paddingLeft: "10px",
            paddingRight: "10px",
            width: "100%",
          }}
        >
          <Card bordered={false}>
            <Flex vertical="false">
              <Flex width="100%" vertical={false} justify="left" align="middle" gap="middle">
                <Typography.Title level={4} style={{ marginRight: "10px" }}>
                  {user?.firstname !== null ? user?.firstname : null}{" "}
                  {user?.lastname !== "" ? user?.lastname : null}
                </Typography.Title>
                <span style={{ marginTop: "26px" }}>
                  <NetworkTypeTag type={user.fromNetwork} />
                </span>
              </Flex>
              <Flex width="100%" vertical={false} justify="left" align="middle" gap="middle">
                <Flex vertical gap="small" style={{ width: "500px" }}>
                  <UserDetail title={t("swizi-user-id")} value={user.id} copyable />

                  {!R.isNil(user.creationDate) ? (
                    <UserDetail
                      title={t("creation-date")}
                      value={dayjs(user.creationDate).format(t("date-format"))}
                    />
                  ) : null}

                  {!R.isNil(user.lastvisit) ? (
                    <UserDetail
                      title={t("last-visit")}
                      value={dayjs(user.lastvisit).format(t("date-format"))}
                    />
                  ) : null}
                </Flex>
                {noPhoto || !user.photoUrl ? null : (
                  <Avatar
                    size={80}
                    src={
                      <Image
                        src={user.photoUrl}
                        style={{ width: 80 }}
                        onError={() => setNoPhoto(true)}
                      />
                    }
                  />
                )}
              </Flex>
              <Flex width="100%" vertical>
                <Row style={{ marginTop: "10px", marginBottom: "10px" }}>
                  <Col span={24}>
                    <Tabs
                      defaultActiveKey="1"
                      items={[
                        { label: t("user-attributes"), key: "1", children: <UserInfos /> },
                        { label: t("user-access"), key: "2", children: <SiteAccess /> },
                      ]}
                    />
                  </Col>
                </Row>
              </Flex>
            </Flex>
          </Card>
          <Card bordered={false}>
            <Row style={{ display: "flex" }}>
              <Typography.Title level={3}>{t("groups-of-user")}</Typography.Title>
              <Button
                type="primary"
                style={{ float: "right", marginLeft: "auto" }}
                size="small"
                onClick={handleAddGroup}
              >
                <Space size="small">
                  <Glyph name={"group_add"} style={{ fontSize: "18px" }} />
                  {t("add-to-group")}
                </Space>
              </Button>
            </Row>
            {
              <Typography.Text style={{ fontSize: "12px", color: colors.grey_60 }}>
                {!user.fullGroups || user.fullGroups.length === 0 ? t("user-has-no-group") : null}
              </Typography.Text>
            }
            {user?.fullGroups.map((info, idx) => (
              <Row key={idx} style={{ height: "35px" }}>
                <Col span={10}>
                  <Space size="middle">
                    <Glyph
                      name="groups"
                      style={{
                        fontSize: "20px",
                        color: colors.interactive_01,
                      }}
                    />

                    <span style={{ display: "flex" }}>
                      <Typography.Text
                        style={{
                          color: colors.grey_60,
                          marginRight: "15px",
                          marginTop: "5px",
                        }}
                      >
                        {info.label}
                      </Typography.Text>
                      <NetworkTypeTag type={info.type} />
                    </span>
                  </Space>
                </Col>
                <Col span={6}>
                  <Glyph name="person" style={{ fontSize: "24px", color: colors.grey_60 }} />
                  {info.nb_users} {t("users")}
                </Col>
                <Col span={5}>
                  <Typography.Link onClick={() => handleMoveToGroup(info.id)}>
                    {t("check-group")}
                  </Typography.Link>
                </Col>
                <Col span={3}>
                  <Tooltip title={t("remove_from_group")}>
                    <Popconfirm
                      title={t("remove-from-group-confirmation", { groupName: info.label })}
                      onConfirm={() => handleRemoveFromGroup(info)}
                      placement="left"
                      okText={t("yes")}
                      cancelText={t("no")}
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
          </Card>
        </Flex>
      </Flex>
    </>
  ) : null;
};

export default UserDetails;
