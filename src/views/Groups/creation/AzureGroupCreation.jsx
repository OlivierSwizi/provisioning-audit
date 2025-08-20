import { useDispatch, useSelector } from "react-redux";
import { API } from "@/services/features/AuthSlice";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Result,
  Row,
  message,
  Select,
  Typography,
  AutoComplete,
  Input,
  Button,
} from "antd";
import { useNavigate } from "react-router-dom";
import { startWorking, stopWorking } from "@/services/features/UISlice";
import { useDebounce } from "use-debounce";
import logger from "@/logger";

const { Text } = Typography;

const AzureGroupCreation = () => {
  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const dispatch = useDispatch();
  const api = useSelector(API);
  const groupList = useSelector((state) => state.groups.groupList);
  const navigate = useNavigate();

  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState();
  const [searchName, setSearchName] = useState("");
  const [selectedAzureGroup, setSelectedAzureGroup] = useState();
  const [groupDisplayName, setGroupDisplayName] = useState("");
  const [azureGroupList, setAzureGroupList] = useState([]);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const [debouncedName] = useDebounce(searchName, 500);

  const handleCreateGroup = async () => {
    try {
      dispatch(startWorking());
      const groupId = await api.groups.addGroup(
        "AZURE_AD",
        selectedAzureGroup.value,
        groupDisplayName,
        selectedTenant,
        "security",
        undefined,
        false,
        false,
      );

      message.success(t("group-created"));
      navigate(`/apps/${appId}/groups/${groupId}`);
    } catch (error) {
      logger.error(error);
      message.error(t("error-occurred"));
    } finally {
      dispatch(stopWorking());
    }
  };

  useEffect(() => {
    if (!appId) return;
    const doIt = async () => {
      try {
        dispatch(startWorking());
        const res = await api.apps.listTenants(appId);
        const tenants = res.map((item) => ({ key: item.name, label: item.name }));
        setTenants(tenants);
        setSelectedTenant(tenants[0].key);
      } catch (e) {
        logger.error(e);
        message.error(t("error-occurred"));
      } finally {
        dispatch(stopWorking());
      }
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId]);

  useEffect(() => {
    const doIt = async () => {
      try {
        dispatch(startWorking());
        setSelectedAzureGroup();
        const res = await api.azure.searchGroup(selectedTenant, debouncedName);
        setAzureGroupList(
          res.map((item) => ({
            value: item.id,
            label: item.displayName,
          })),
        );
      } catch (e) {
        logger.error(e);
        message.error(t("error-occurred"));
      } finally {
        dispatch(stopWorking());
      }
    };

    if (!debouncedName) return setAzureGroupList([]);
    if (azureGroupList.find((item) => item.label === debouncedName)) return;
    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);

  const handleSelectGroup = (group) => {
    const selectedGroup = azureGroupList.find((item) => item.value === group);
    setSelectedAzureGroup(selectedGroup);
    setSearchName(selectedGroup.label);
    setGroupDisplayName(selectedGroup.label);
    setAlreadyExists(!!groupList.find((item) => item.externalId === selectedGroup.value));
  };

  if (!appId) return <></>;
  if (tenants.length === 0) {
    return (
      <Row style={{ width: "100%" }}>
        <Col span={12} offset={6}>
          <Card bordered={false}>
            <Result
              status="404"
              title={t("no-azure-config-found")}
              subTitle={t("no-tenant-found-subtitle")}
            />
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Card bordered={false}>
      <Row style={{ width: "100%" }}>
        <Col span={8}>
          <Text>{t("tenant-selection")}</Text>
        </Col>
        <Col span={8}>
          <Select value={selectedTenant} onSelect={(v) => setSelectedTenant(v)}>
            {tenants.map((item) => (
              <Select.Option key={item.key} value={item.key}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
      <Row style={{ width: "100%", marginTop: "15px" }}>
        <Col span={8}>
          <Text>{t("group-azure-selection")}</Text>
        </Col>
        <Col span={8}>
          <AutoComplete
            placeholder={t("search-group")}
            options={azureGroupList}
            allowClear
            onSearch={setSearchName}
            onSelect={handleSelectGroup}
            value={searchName}
            style={{ width: "100%" }}
          />
        </Col>
      </Row>
      {selectedAzureGroup && (
        <>
          <Row style={{ width: "100%", marginTop: "15px" }}>
            <Col span={8}>
              <Text>{t("group-displayname")}</Text>
            </Col>
            <Col span={8}>
              <Input
                value={groupDisplayName}
                onChange={(e) => setGroupDisplayName(e.target.value)}
              />
            </Col>
          </Row>
          <Row justify="center" style={{ width: "100%", marginTop: "25px" }}>
            {alreadyExists ? (
              <Typography.Text type="danger">{t("azure-group-already-exists")}</Typography.Text>
            ) : (
              <Button type="primary" style={{ width: "250px" }} onClick={handleCreateGroup}>
                {t("add")}
              </Button>
            )}
          </Row>
        </>
      )}
    </Card>
  );
};

export default AzureGroupCreation;
