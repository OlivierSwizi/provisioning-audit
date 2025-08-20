import { useTranslation } from "react-i18next";

import {
  Row,
  Col,
  Typography,
  Button,
  Space,
  Input,
  Card,
  Tabs,
  Pagination,
  Select,
  Checkbox,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDebounce } from "use-debounce";
import { useWorkDispatch } from "@/services/features/UISlice";

import Glyph from "../../common/Glyph";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useDesignTokens from "@/hook/useDesignTokens";
import NetworkTypeTag from "@/components/NetworkTypeTag";
import { searchGroups, updateGroupFilter } from "@/services/features/GroupsSlice";
import GroupTypeGlyph from "@/components/GroupTypeGlyph";

const { Text, Title } = Typography;
const typesOptions = [
  { label: "API", value: "API" },
  { label: "Azure AD", value: "AZURE_AD" },
  { label: "Composites", value: "COMPOSIT" },
  { label: "SCIM", value: "SCIM" },
  { label: "Swizi", value: "SWIZI" },
];

const GroupList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workDispatch = useWorkDispatch();
  const dispatch = useDispatch();
  const { colors } = useDesignTokens();
  const groupFilter = useSelector((state) => state.groups.filter);

  const appId = useSelector((state) => state.apps.selectedApp.id);

  const [groupList, setGroupList] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(9);
  const [filter, setFilter] = useState(groupFilter);
  const [favoriteList, setFavoriteList] = useState([]);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [types, setTypes] = useState(["AZURE_AD", "SWIZI", "COMPOSIT", "SCIM"]);

  const [debouncedFilter] = useDebounce(filter, 500);

  const handleRefresh = async (filterUpdated = false) => {
    const groups = await workDispatch(
      searchGroups(filter, types, includeArchived, filterUpdated ? 1 : page, pageSize),
    );
    setGroupList(groups.items || []);
    setTotal(groups.total);
    if (filterUpdated) {
      setPage(1);
    }
  };

  // Load favoriteList from localStorage when component mounts
  useEffect(() => {
    const storedFavoriteList = localStorage.getItem("favoriteGroupList");
    if (storedFavoriteList) {
      setFavoriteList(JSON.parse(storedFavoriteList));
    }
  }, []);

  // Save favoriteList to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("favoriteGroupList", JSON.stringify(favoriteList));
  }, [favoriteList]);

  useEffect(() => {
    if (!appId) return;
    dispatch(updateGroupFilter(debouncedFilter));
    handleRefresh(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, debouncedFilter, types, includeArchived]);

  useEffect(() => {
    if (!appId) return;
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const SearchGroup = (
    <>
      <Row>
        <Col span={24}>
          <Input
            size="large"
            allowClear
            onChange={(e) => {
              setFilter(e.target.value);
            }}
            prefix={<SearchOutlined />}
            addonAfter={
              <Glyph name={"refresh"} style={{ cursor: "pointer" }} onClick={handleRefresh} />
            }
            placeholder={t("groups.search-group")}
            value={filter}
          />
        </Col>
        <Col span={24} style={{ marginTop: "16px" }}>
          <Space>
            <Select
              mode="multiple"
              style={{ width: "100%", minWidth: "200px", padding: "10px" }}
              placeholder={t("groups.types")}
              value={types}
              onChange={(value) => setTypes(value)}
              size="small"
            >
              {typesOptions.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Space>
          <Space>
            <Checkbox
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
            >
              {t("groups.include-archived")}
            </Checkbox>
          </Space>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <section style={{ marginTop: "16px", padding: "10px 0" }}>
            <div
              style={{
                display: "grid",
                gridGap: "10px",
                gridTemplateColumns: "repeat(auto-fill, 380px)",
              }}
            >
              {(groupList || []).map((item, idx) => (
                <Card
                  key={idx}
                  onClick={() => navigate(`/apps/${appId}/groups/${item.id}`)}
                  style={{ cursor: "pointer" }}
                  title={
                    <div style={{ display: "flex", flexFlow: "column" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <Text strong>
                          <GroupTypeGlyph group={item} />
                        </Text>
                        <Text copyable style={{ fontSize: "12px" }}>
                          {item.id}
                        </Text>
                        {item.isArchived && (
                          <Text type="danger" style={{ marginLeft: "8px" }}>
                            {t("groups.archived")}
                          </Text>
                        )}
                      </div>

                      <Title level={5}>{item.label}</Title>
                    </div>
                  }
                  extra={
                    item.isArchived ? null : (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {favoriteList.includes(item.id) ? (
                          <Glyph
                            name="star"
                            style={{
                              fontSize: "20px",
                              color: colors.secondary_base,
                              cursor: "pointer",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFavoriteList(favoriteList.filter((id) => id !== item.id));
                            }}
                          />
                        ) : (
                          <Glyph
                            name="star_border"
                            style={{ fontSize: "20px", color: colors.grey_60, cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFavoriteList([...favoriteList, item.id]);
                            }}
                          />
                        )}
                      </div>
                    )
                  }
                  bordered={false}
                >
                  <Space style={{ color: colors.grey_60, width: "100%" }} />
                  <Row style={{ width: "100%" }}>
                    <Col span={12}>
                      <Typography.Text type={"secondary"}>
                        <Glyph name={"person"} /> {item.nbUsers} {t("groups.users")}
                      </Typography.Text>
                    </Col>
                    <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
                      <NetworkTypeTag type={item.type} />
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          </section>
        </Col>
        <Col span={24} style={{ display: "flex", justifyContent: "center", marginTop: "25px" }}>
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            pageSizeOptions={["9", "18", "27"]}
            showSizeChanger
            onChange={(page, pageSize) => {
              setPage(page);
              setPageSize(pageSize);
            }}
          />
        </Col>
      </Row>
    </>
  );

  const FavoriteGroups = (
    <>
      <section style={{ marginTop: "16px", padding: "10px 0" }}>
        <div
          style={{
            display: "grid",
            gridGap: "10px",
            gridTemplateColumns: "repeat(auto-fill, 380px)",
          }}
        >
          {(groupList || [])
            .filter((item) => favoriteList.includes(item.id))
            .map((item, idx) => (
              <Card
                key={idx}
                onClick={() => navigate(`/apps/${appId}/groups/${item.id}`)}
                style={{ cursor: "pointer" }}
                title={
                  <div style={{ display: "flex", flexFlow: "column" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text strong>
                        <Glyph
                          style={{
                            marginRight: "8px",
                            verticalAlign: "-4px",
                            fontWeight: "normal",
                            color: colors.secondary_base,
                          }}
                          name="groups"
                        />
                      </Text>
                      <Text copyable style={{ fontSize: "12px" }}>
                        {item.id}
                      </Text>
                    </div>

                    <Title level={5}>{item.label}</Title>
                  </div>
                }
                extra={
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {favoriteList.includes(item.id) ? (
                      <Glyph
                        name="star"
                        style={{
                          fontSize: "20px",
                          color: colors.secondary_base,
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavoriteList(favoriteList.filter((id) => id !== item.id));
                        }}
                      />
                    ) : (
                      <Glyph
                        name="star_border"
                        style={{ fontSize: "20px", color: colors.grey_60, cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavoriteList([...favoriteList, item.id]);
                        }}
                      />
                    )}
                  </div>
                }
                bordered={false}
              >
                <Space style={{ color: colors.grey_60, width: "100%" }} />
                <Row style={{ width: "100%" }}>
                  <Col span={12}>
                    <Typography.Text type={"secondary"}>
                      <Glyph name={"person"} /> {item.nbUsers} {t("groups.users")}
                    </Typography.Text>
                  </Col>
                  <Col span={12} style={{ display: "flex", justifyContent: "flex-end" }}>
                    <NetworkTypeTag type={item.type} />
                  </Col>
                </Row>
              </Card>
            ))}
        </div>
      </section>
    </>
  );

  const handleAddGroup = async () => {
    navigate(`/apps/${appId}/groups/new`);
  };

  return (
    <>
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Row style={{ marginBottom: "25px" }}>
            <Col span={4} push={2}>
              <Button
                type="primary"
                style={{ float: "right" }}
                size="large"
                onClick={handleAddGroup}
              >
                <Space size="small">
                  <Glyph name={"group_add"} style={{ fontSize: "18px" }} />
                  {t("groups.add-group")}
                </Space>
              </Button>
            </Col>
          </Row>
        </Col>
        <Col span={23}>
          <Tabs
            items={[
              { label: t("groups.Groups"), key: "groups", children: SearchGroup },
              { label: t("groups.Favorites"), key: "favorites", children: FavoriteGroups },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default GroupList;
