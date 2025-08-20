import SwiziJoyrideTitle from "@/assets/joyride/SwiziJoyrideTitle";

import { LeftOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Flex,
  Input,
  Layout,
  message,
  Modal,
  Row,
  Select,
  Switch,
  Tabs,
  Typography,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { concat, cond, equals, T } from "ramda";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkDispatch } from "@/services/features/UISlice";

import NetworkTypeTag from "@/components/NetworkTypeTag";
import { useSelectUserModal } from "@/components/modal/SelectUserModal";
import { API } from "@/services/features/AuthSlice";
import { useConfirmModal } from "@/components/modal/ConfirmModal";
import { usePromptModal } from "@/components/modal/PromptModal";
import { useUserModal } from "@/components/modal/UserModal";

import logger from "@/logger";
import SiteSelector from "@/components/SiteSelector";
import Sectors from "./GroupTabs/Sectors";
import Users from "./GroupTabs/Users";
import Managers from "./GroupTabs/Managers";
import ChildrenGroups from "./GroupTabs/ChildrenGroups";
import Features from "./GroupTabs/Features";
import IM from "./GroupTabs/IM";
import { createUser } from "@/services/features/UsersSlice";
import {
  addManagersToGroup,
  addSectorToGroup,
  addUsersToGroup,
  createIMChannel,
  deleteGroup,
  getGroup,
  listMessages,
  publishIMMessage,
  removeManagersFromGroup,
  removeSectorFromGroup,
  renameGroup,
  setBusinessGroup,
  syncAzureGroup,
  udpateGroupDescription,
  updateContactList,
  updateFeatureConfig,
  updateGroupSite,
  updateIMMessage,
  updateOptions,
} from "@/services/features/GroupsSlice";
import GroupTypeGlyph from "@/components/GroupTypeGlyph";

const { Text } = Typography;

const GroupDetails = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const workDispatch = useWorkDispatch();
  const api = useSelector(API);

  const [trigger, setTrigger] = useState(false);

  const [selectUsers, SelectUserModal] = useSelectUserModal();
  const [confirm, ConfirmModal] = useConfirmModal();
  const [askPrompt, PromptModal] = usePromptModal();
  const [askUserInfos, CreateUserModal] = useUserModal();

  const [description, setDescription] = useState("");

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const buttonDownloadRef = useRef(null);

  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [messageList, setMessageList] = useState([]);

  const { isUserGroupAdmin, isIMActive } = useSelector((state) => state.apps);

  const loadGroup = async (id) => {
    try {
      const group = await workDispatch(getGroup(id));
      setGroup(group);
      setDescription(group.description || "");
    } catch (error) {
      logger.error(error);
      message.error(t("error-occurred"));
    }
  };

  const loadMessages = async () => {
    try {
      if (!group) return;
      if (!group.isChatChannel) return setMessageList([]);
      const messages = await workDispatch(listMessages(group));
      setMessageList(messages);
    } catch (error) {
      logger.error(error);
      message.error(t("failed-to-load-messages"));
    }
  };

  useEffect(() => {
    if (group) loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  useEffect(() => {
    if (!groupId) return;
    loadGroup(parseInt(groupId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleAddUsers = async () => {
    const userIds = await selectUsers();
    if (!userIds && !userIds.length) return;

    try {
      await workDispatch(addUsersToGroup(group, userIds));
      message.success(t("users-added-to-group"));
    } catch (error) {
      logger.log(error);
      message.error(t("error-occurred"));
    }
    // need to wait to let user creation finish
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setTrigger(!trigger);
  };

  const handleCreateAndAddUser = async () => {
    let createdUser;

    const user = await askUserInfos();
    if (!user) return;

    try {
      createdUser = await workDispatch(createUser(user));
    } catch (error) {
      logger.log(error);
      message.error(t("failed-to-create-user"));
      return;
    }

    try {
      await workDispatch(addUsersToGroup(group, [createdUser.id]));
      message.success(t("user-created-and-added-to-group"));
    } catch (error) {
      logger.log(error);
      message.error(t("created-failed-to-add-to-group"));
    }
    loadGroup(group.id);
  };

  const handleAddManagers = async () => {
    const managerIds = await selectUsers();
    if (!managerIds && !managerIds.length) return;

    try {
      await workDispatch(addManagersToGroup(group, managerIds));
      message.success(t("managers-added-to-group"));
    } catch (error) {
      logger.log(error);
      message.error(t("error-occurred"));
    }

    loadGroup(group.id);
  };

  const handleUploadExcel = async (file) => {
    try {
      const answer = await confirm(
        t("upload-excel-file-confirm-title"),
        t("upload-excel-file-confirm-text"),
      );
      if (answer) {
        await api.groups.uploadUsersExcelToGroup(group.id, file);
        message.success(t("upload-success"));
        loadGroup(group.id);
      }
    } catch (error) {
      logger.log(error);
      message.error(t("error-occurred"));
    }
  };

  const handleUpdateDescription = async () => {
    try {
      await workDispatch(udpateGroupDescription(group, description));
      message.success(t("group-description-updated"));
    } catch (error) {
      logger.log(error);
      message.error(t("error-occurred"));
    }
    loadGroup(group.id);
  };

  const handleDownloadExcel = async () => {
    try {
      const blob = await api.groups.downloadUsersExcelFromGroup(group.id);
      const timestamp = dayjs().format("YYYY-MM-DD-HH-mm-ss");
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${group.label}-${timestamp}.xlsx`;
      a.click();
      message.success(t("download-success"));
    } catch (error) {
      logger.log(error);
      message.error(t("error-occurred"));
    }
  };

  const handleRenameGroup = async () => {
    const newName = await askPrompt(t("rename-group"), t("group-name"), group.label);
    if (newName) {
      try {
        await workDispatch(renameGroup(group, newName));
        message.success(t("group-renamed"));
      } catch (error) {
        logger.log(error);
        message.error(t("error-occurred"));
      }
      loadGroup(group.id);
    }
  };

  const handleSyncAzureUsers = async (withPhoto) => {
    try {
      await workDispatch(syncAzureGroup([group], withPhoto));
      message.success(t("users-sync-launched"));
    } catch (error) {
      logger.error(error);
      message.error(t("error-occurred"));
    }

    loadGroup(group.id);
  };

  const handleDeleteGroup = async () => {
    await Modal.confirm({
      title: t("confirm"),
      content: t("delete-group-confirm"),
      onOk: async () => {
        try {
          await workDispatch(deleteGroup(group));
          message.success(t("group-deleted"));
          navigate(-1);
        } catch (error) {
          logger.error(error);
          message.error(t("error-occurred"));
        }
      },
    });
  };

  const handleSwitchIsBusinessGroup = async () => {
    try {
      await workDispatch(setBusinessGroup(group));
    } catch (error) {
      logger.log(error);
      message.error(t("error-occurred"));
    }

    loadGroup(group.id);
  };

  const handleUpdateSiteProvisioning = async (siteId) => {
    if (siteId !== group.provisioningSiteId) {
      try {
        await workDispatch(updateGroupSite(group, siteId));
      } catch (error) {
        logger.log(error);
        message.error(t("error-occurred"));
      }
      loadGroup(group.id);
    }
  };

  const handleIMChannelChange = async () => {
    if (group.isChatChannel) return message.warn(t("im-channnel-cant-be-removed"));
    try {
      const msg = await askPrompt("", t("im-channel-welcome-message"), {
        type: "textarea",
      });
      if (msg) {
        await workDispatch(createIMChannel(group));
        await workDispatch(publishIMMessage(group, msg));
        message.success(t("im-channel-updated"));
      }
    } catch (error) {
      logger.log(error);
      message.error(t("error-occurred"));
    }

    loadMessages();
  };

  const handlePublishIMMessage = async (type) => {
    try {
      const titleI18n = cond([
        [equals("ANNOUNCEMENT"), () => t("publish-im-announce")],
        [equals("ADMIN"), () => t("publish-im-message")],
        [T, () => ""],
      ])(type);
      const successI18n = cond([
        [equals("ANNOUNCEMENT"), () => t("announce-published")],
        [equals("ADMIN"), () => t("message-published")],
        [T, () => ""],
      ])(type);

      const msg = await askPrompt("", titleI18n, {
        type: "textarea",
      });
      if (msg) {
        await workDispatch(publishIMMessage(group, msg, type));
        message.success(successI18n);
      }
    } catch (error) {
      logger.error(error);
      message.error(t("error-occurred"));
    }

    loadMessages();
  };

  const handleUpdateIMMessage = async (msgId, type) => {
    try {
      const successI18n = cond([
        [equals("ANNOUNCEMENT"), () => t("announce-published")],
        [equals("ADMIN"), () => t("message-published")],
        [T, () => ""],
      ])(type);

      const currentMessage = messageList.find((msg) => msg.id === msgId);
      if (!currentMessage) return;

      const msg = await askPrompt("", t("updateannounce-message"), {
        type: "textarea",
        default: currentMessage.message,
      });
      if (msg) await workDispatch(updateIMMessage(group, msgId, msg, type));
      message.success(successI18n);
    } catch (error) {
      logger.error(error);
      message.error(t("error-occurred"));
    }

    loadMessages();
  };

  const handleRemoveManagerFromGroup = async (userId) => {
    try {
      await workDispatch(removeManagersFromGroup(group, [userId]));
      message.success(t("manager-removed-from-group"));
    } catch (error) {
      message.error(t("error-occurred"));
      logger.log(error);
    }
    loadGroup(group.id);
  };

  const handleUpdateOption = (option, value) => {
    workDispatch(updateOptions(group, { [option]: value }));
    loadGroup(group.id);
  };

  const handleUpdateContactList = async (isInContactList, restrictMembers) => {
    try {
      await workDispatch(updateContactList(group, isInContactList, restrictMembers));
      message.success(t("contact-list-updated"));
    } catch (error) {
      logger.error(error);
      message.error(t("error-occurred"));
    }
    loadGroup(group.id);
  };

  const handleUpdateParkingTags = async (tags) => {
    try {
      await workDispatch(
        updateOptions(group, {
          groupConfig: { ...group.groupConfig, parking: { tags } },
        }),
      );
      message.success(t("parking-tags-updated"));
    } catch (error) {
      logger.error(error);
      message.error(t("error-occurred"));
    }
    loadGroup(group.id);
  };

  const handleRemoveSector = async (siteId, sectorId) => {
    try {
      await workDispatch(removeSectorFromGroup(group, siteId, sectorId));
      message.success(t("sector-removed-from-group"));
    } catch (error) {
      message.error(t("error-occurred"));
      logger.log(error);
    }
    loadGroup(group.id);
  };

  const handleAddSector = async (sector) => {
    try {
      await workDispatch(addSectorToGroup(group, sector.siteId, sector.sectorId));
      message.success(t("sector-added-to-group"));
    } catch (error) {
      logger.log(error);
      message.error(t("error-occurred"));
    }
    loadGroup(group.id);
  };

  const handleUpdateFeaturesConfig = async (featureConfig) => {
    try {
      await workDispatch(updateFeatureConfig(group, featureConfig));
      message.success(t("features-updated"));
    } catch (error) {
      logger.log(error);
      message.error(t("error-occurred"));
    }
    loadGroup(group.id);
  };

  const handleMenuAction = (action) => {
    switch (action) {
      case "add-user":
        handleAddUsers();
        break;
      case "download-excel-file":
        handleDownloadExcel();
        break;
      case "upload-excel-file":
        buttonDownloadRef.current.click();
        break;
      case "rename-group":
        handleRenameGroup();
        break;
      case "sync-users":
        handleSyncAzureUsers(false);
        break;
      case "sync-users-photo":
        handleSyncAzureUsers(true);
        break;
      case "delete-group":
        handleDeleteGroup();
        break;
      case "show-hide-advanced-options":
        setShowAdvancedOptions(!showAdvancedOptions);
        break;
      case "create-and-add-user":
        handleCreateAndAddUser();
        break;

      default:
        break;
    }
  };

  let actionsMenu = [
    { label: t("actions"), value: "actions" },
    {
      label: t("rename-group"),
      value: "rename-group",
    },
    {
      label: t("add-new-user"),
      value: "create-and-add-user",
      disabled: group?.type === "COMPOSIT",
    },

    { label: t("add-existing-users"), value: "add-user", disabled: group?.type === "COMPOSIT" },
    {
      label: t("download-excel-file"),
      value: "download-excel-file",
      disabled: group?.type === "COMPOSIT",
    },
    {
      label: t("upload-excel-file"),
      value: "upload-excel-file",
      disabled: group?.type === "COMPOSIT",
    },
  ];

  if (group?.provisioningType === "business") {
    actionsMenu = concat(actionsMenu, [
      {
        label: t("delete-group"),
        value: "delete-group",
      },
    ]);
  }

  if (isUserGroupAdmin) {
    actionsMenu = concat(actionsMenu, [
      {
        label: t("sync-users"),
        value: "sync-users",
        disabled: group?.type !== "AZURE_AD",
      },
      {
        label: t("sync-users-photo"),
        value: "sync-users-photo",
        disabled: group?.type !== "AZURE_AD",
      },
      {
        label: showAdvancedOptions ? t("hide-advanced-options") : t("show-advanced-options"),
        value: "show-hide-advanced-options",
      },
    ]);
  }

  if (!group) return null;

  const renderAzureInfos = () => {
    if (group.type !== "AZURE_AD") return null;

    return (
      <>
        <Descriptions.Item label={t("azure-ad-id")}>
          <Text copyable>{group.externalId}</Text>
        </Descriptions.Item>

        <Descriptions.Item label={t("azure-ad-groupname")}>
          <Text copyable>{group.externalName || t("no-azure-group-found")}</Text>
        </Descriptions.Item>
      </>
    );
  };

  const renderAPIInfos = () => {
    if (group.type !== "API") return null;
    if (!group.externalId) return null;

    return (
      <>
        <Descriptions.Item label={t("api-group-id")}>
          <Text copyable>{group.externalId}</Text>
        </Descriptions.Item>
      </>
    );
  };

  const renderSwiziInfos = () => {
    if (group.type !== "SWIZI" && group.type !== "COMPOSIT") return null;

    return (
      <>
        {isUserGroupAdmin ? (
          <Descriptions.Item label={t("swizi-business-group-type")}>
            <Checkbox
              checked={group.provisioningType === "business"}
              onChange={handleSwitchIsBusinessGroup}
            />
          </Descriptions.Item>
        ) : null}
        {group.provisioningType === "business" && isUserGroupAdmin ? (
          <Descriptions.Item label={t("swizi-group-linked-site")}>
            <SiteSelector
              value={group.provisioningSiteId}
              onChange={handleUpdateSiteProvisioning}
            />
          </Descriptions.Item>
        ) : null}
      </>
    );
  };

  const RenderOption = ({ title, option }) => {
    return (
      <Col span={8}>
        <div className="toggle-switch">
          <Switch
            className="toggle-input"
            size="small"
            checked={!!group[option]}
            onChange={(checked) => handleUpdateOption(option, checked)}
          />
          <span className="toggle-label">{title}</span>
        </div>
      </Col>
    );
  };

  return (
    <Layout style={{ height: "100%", gap: 20 }}>
      {SelectUserModal}
      {ConfirmModal}
      {PromptModal}
      {CreateUserModal}
      <Upload
        accept=".xlsx"
        beforeUpload={() => false}
        itemRender={() => null}
        fileList={[]}
        onChange={(info) => {
          handleUploadExcel(info.file);
        }}
      >
        <Button ref={buttonDownloadRef} style={{ display: "none" }} />
      </Upload>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Button size="middle" type="text" onClick={() => navigate(-1)} icon={<LeftOutlined />}>
            {t("back")}
          </Button>
        </Col>
        <Col span={24}>
          <Card bordered={false}>
            <Row gutter={[20, 20]} style={{ width: "100%" }}>
              <Col span={24} style={{ display: "flex", alignItems: "center" }}>
                <GroupTypeGlyph group={group} />

                <SwiziJoyrideTitle
                  title={group.label}
                  screen="groupDetails"
                  style={{ marginRight: "15px", marginTop: "12px" }}
                  tag={<NetworkTypeTag type={group.type} />}
                />

                {group.isArchived && (
                  <Text type="danger" style={{ marginLeft: "10px" }}>
                    {t("group-archived-explanation")}
                  </Text>
                )}

                <span
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Select
                    options={actionsMenu}
                    value={"actions"}
                    style={{ width: "250px" }}
                    onSelect={handleMenuAction}
                  />
                </span>
              </Col>
              <Col span={18}>
                <Descriptions column={1} size={"small"} bordered>
                  {renderAzureInfos()}
                  {renderAPIInfos()}

                  <Descriptions.Item label={t("swizi-user-id")}>
                    <Text copyable>{group.id}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label={t("description")}>
                    <Flex vertical gap="small" align="center" justify="space-between">
                      <Input.TextArea
                        value={description}
                        onChange={(v) => setDescription(v.target.value)}
                      />
                      <Button style={{ width: "150px" }} onClick={handleUpdateDescription}>
                        {t("save")}
                      </Button>
                    </Flex>
                  </Descriptions.Item>
                  <Descriptions.Item label={t("user-count-in-this-group")}>
                    {group.nbUsers}
                  </Descriptions.Item>
                  <Descriptions.Item label={t("group-is-archived")}>
                    <Switch
                      className="joyride-group-archived"
                      checked={group.isArchived}
                      onChange={(checked) => handleUpdateOption("isArchived", checked)}
                      size="small"
                    />
                  </Descriptions.Item>
                  {renderSwiziInfos()}
                  <Descriptions.Item label={t("show-group-contact-list")}>
                    <Switch
                      checked={group.isInContactList}
                      onChange={(checked) => handleUpdateContactList(checked, false)}
                      size="small"
                    />
                  </Descriptions.Item>
                  {group.isInContactList && (
                    <Descriptions.Item
                      label={
                        <Typography.Text style={{ marginLeft: "15px" }}>
                          {t("restrict-contact-list-to-members")}
                        </Typography.Text>
                      }
                    >
                      <Switch
                        checked={group.restrictMembers}
                        onChange={(checked) => handleUpdateContactList(true, checked)}
                        size="small"
                      />
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label={t("parking-tags")} style={{ width: "150px" }}>
                    <Select
                      mode="tags"
                      style={{ width: "100%" }}
                      size="middle"
                      onChange={handleUpdateParkingTags}
                      value={group.groupConfig?.parking?.tags || []}
                    >
                      {(group.groupConfig?.parking?.tags || []).map((tag) => (
                        <Select.Option key={tag} value={tag}>
                          {tag}
                        </Select.Option>
                      ))}
                    </Select>
                  </Descriptions.Item>
                </Descriptions>
              </Col>

              {group.type !== "SITE" && showAdvancedOptions && (
                <Col span={18}>
                  <Row gutter={[20, 20]} style={{ width: "100%" }}>
                    <RenderOption title={t("facility-group-type")} option={"facility"} />
                    <RenderOption title={t("communication-group-type")} option={"communication"} />
                    <RenderOption title={t("ticketing-group-type")} option={"ticketing"} />
                    <RenderOption title={t("accueil-group-type")} option={"accueil"} />
                    <RenderOption title={t("analytics-group-type")} option={"analytics"} />
                    <RenderOption title={t("canChat-group-type")} option={"canChat"} />
                    <RenderOption title={t("searchable-group-type")} option={"searchable"} />
                    {/*<RenderOption title={t("isTeam-group-type")} option={"isTeam"} />*/}
                  </Row>
                </Col>
              )}
            </Row>
          </Card>
        </Col>
      </Row>
      <Tabs>
        <Tabs.TabPane tab={t("users")} key="users">
          <Users
            onAddUsers={handleAddUsers}
            isAdmin={isUserGroupAdmin}
            onCreateAndAdd={handleCreateAndAddUser}
            group={group}
            trigger={trigger}
          />
        </Tabs.TabPane>
        {group?.type === "COMPOSIT" && (
          <Tabs.TabPane tab={t("children")} key="childrenusers">
            <ChildrenGroups
              onAddUsers={handleAddUsers}
              isAdmin={isUserGroupAdmin}
              onCreateAndAdd={handleCreateAndAddUser}
              group={group}
              trigger={trigger}
            />
          </Tabs.TabPane>
        )}
        <Tabs.TabPane tab={t("managers")} key="managers">
          <Managers
            group={group}
            onAddManagers={handleAddManagers}
            onRemoveManagerFromGroup={handleRemoveManagerFromGroup}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab={t("sectors")} key="sectors">
          <Sectors
            group={group}
            onAddSector={handleAddSector}
            onRemoveSector={handleRemoveSector}
          />
        </Tabs.TabPane>
        {isIMActive && (
          <Tabs.TabPane tab={t("instant-messaging")} key="im">
            <IM
              group={group}
              messageList={messageList}
              onActiveIM={handleIMChannelChange}
              onPublishMessage={handlePublishIMMessage}
              onUpdateMessage={handleUpdateIMMessage}
            />
          </Tabs.TabPane>
        )}
        <Tabs.TabPane tab={t("features")} key="features">
          <Features group={group} onUpdateFeaturesConfig={handleUpdateFeaturesConfig} />
        </Tabs.TabPane>
      </Tabs>
    </Layout>
  );
};

export default GroupDetails;
