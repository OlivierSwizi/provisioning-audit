import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Card, Col, Row, message, Typography, Input, Button, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { useWorkDispatch } from "@/services/features/UISlice";
import logger from "@/logger";
import { createGroup, searchGroups } from "@/services/features/GroupsSlice";

const { Text } = Typography;

const CompositGroupCreation = () => {
  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const { isUserGroupAdmin, siteList } = useSelector((state) => state.apps);

  const navigate = useNavigate();
  const workDispatch = useWorkDispatch();

  const [groupDisplayName, setGroupDisplayName] = useState("");
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [siteId, setSiteId] = useState(siteList?.[0]?.id);
  const [createIMChannel, setCreateIMChannel] = useState(false);
  const [debounceText] = useDebounce(groupDisplayName, 500);

  useEffect(() => {
    setCreateIMChannel(false);
    setGroupDisplayName("");
  }, []);

  useEffect(() => {
    if (!debounceText) return setAlreadyExists(false);
    checkGroupDisplayName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceText]);

  const checkGroupDisplayName = async () => {
    const existing = await workDispatch(searchGroups(debounceText, null, true, 1, 1, false));
    setAlreadyExists(existing.items.length === 1 && existing.items[0]?.label === debounceText);
  };

  const handleCreateGroup = async () => {
    try {
      const newGroupId = await workDispatch(
        createGroup({
          type: "COMPOSIT",
          displayName: groupDisplayName,
          provisioningType: isUserGroupAdmin ? "security" : "business",
          provisioningSite: siteId,
          createIMChannel,
        }),
      );
      /* if (createIMChannel)
        await workDispatch(publishIMAnnouncement(newGroupId, imChannelWelcomeMessage));*/
      message.success(t("group-created"));

      navigate(`/apps/${appId}/groups/${newGroupId}`);
    } catch (error) {
      logger.error(error);
      message.error(t("error-occurred"));
    }
  };

  if (!appId) return <></>;

  return (
    <Card bordered={false}>
      <>
        <Row style={{ width: "100%", marginTop: "15px" }}>
          <Col span={8}>
            <Text>{t("group-displayname")}</Text>
          </Col>
          <Col span={8}>
            <Input
              autoComplete="off"
              value={groupDisplayName}
              onChange={(e) => setGroupDisplayName(e.target.value)}
            />
          </Col>
        </Row>

        {!isUserGroupAdmin ? (
          <Row style={{ width: "100%", marginTop: "15px" }}>
            <Col span={8}>
              <Text>{t("group-site-link")}</Text>
            </Col>
            <Col span={8}>
              <Select value={siteId} onChange={(value) => setSiteId(value)}>
                {siteList.map((site) => (
                  <Select.Option key={site.id} value={site.id}>
                    {site.label}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
        ) : null}

        <Row justify="center" style={{ width: "100%", marginTop: "25px" }}>
          {alreadyExists ? (
            <Typography.Text type="danger">{t("swizi-group-already-exists")}</Typography.Text>
          ) : (
            <Button
              type="primary"
              style={{ width: "250px" }}
              onClick={handleCreateGroup}
              disabled={
                !groupDisplayName ||
                groupDisplayName.length === 0 ||
                (isUserGroupAdmin && !siteId) /*||
                (createIMChannel && !imChannelWelcomeMessage)*/
              }
            >
              {t("add")}
            </Button>
          )}
        </Row>
      </>
    </Card>
  );
};

export default CompositGroupCreation;
