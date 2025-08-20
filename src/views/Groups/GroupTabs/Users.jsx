import Glyph from "@/common/Glyph";
import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Flex,
  Input,
  Pagination,
  Popconfirm,
  Row,
  Tooltip,
  Typography,
  message,
} from "antd";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "use-debounce";
import { useWorkDispatch } from "@/services/features/UISlice";
import useDesignTokens from "@/hook/useDesignTokens";
import helpers from "@/helpers";

import { API } from "@/services/features/AuthSlice";

import logger from "@/logger";

const Users = ({ onAddUsers, onCreateAndAdd, isAdmin, group, trigger }) => {
  const { t } = useTranslation();
  const workDispatch = useWorkDispatch();
  const navigate = useNavigate();

  const api = useSelector(API);

  const { colors } = useDesignTokens();

  const appId = useSelector((state) => state.apps.selectedApp.id);

  const [filter, setFilter] = useState("");
  const [debouncedFilter] = useDebounce(filter, 500);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useState([]);

  const loadUsers = (filterUpdated = false) => {
    workDispatch(async () => {
      const result = await api.groups.usersOfGroup(
        group.id,
        filterUpdated ? 1 : page,
        pageSize,
        debouncedFilter,
      );

      if (filterUpdated) setPage(1);
      setTotal(result.totalItems);
      setUsers(result.items);
    });
  };

  useEffect(() => {
    if (group) loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  useEffect(() => {
    if (group) loadUsers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilter]);

  useEffect(() => {
    loadUsers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleRemoveUserFromGroup = async (userId) => {
    await workDispatch(async () => {
      try {
        await api.groups.removeUsersFromGroup(group.id, [userId]);
      } catch (error) {
        logger.error(error);
        message.error(t("error-occurred"));
      }
    });
    loadUsers();
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
      <Row gutter={[10, 10]}>
        <Col span={14}>
          <Flex vertical>
            <Flex horizontal>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {t("user-of-group")}
              </Typography.Title>
              <Glyph
                name="refresh"
                style={{
                  fontSize: "18px",
                  color: colors.primary_base,
                  cursor: "pointer",
                }}
              />
            </Flex>
            {group.type === "COMPOSIT" ? (
              <Typography.Text type="secondary">
                {t("composit-group-no-children-user")}
              </Typography.Text>
            ) : null}
          </Flex>
        </Col>

        {group.type !== "COMPOSIT" && (
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
              block
              onClick={onCreateAndAdd}
            >
              {t("add-new-user")}
            </Button>
          </Col>
        )}

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
            onClick={onAddUsers}
            block
          >
            {t("add-existing-users")}
          </Button>
        </Col>

        <Col span={24}>
          <Input
            placeholder={t("search-user")}
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
            }}
            prefix={<SearchOutlined />}
          />
        </Col>
      </Row>
      <div style={{ flexGrow: 1, overflowY: "auto" }}>
        {group.nbUsers === 0 ? (
          <Typography.Title level={5} style={{ textAlign: "center" }}>
            {t("no-user-in-group")}
          </Typography.Title>
        ) : (
          <Row>
            {users.map((user) => {
              return (
                <Col span={12} key={user.id}>
                  <Row gutter={[10, 10]} style={{ width: "100%" }}>
                    <Col key={user.id} span={8}>
                      {helpers.formatUserName(user)}
                    </Col>

                    {isAdmin ? (
                      <Col span={8}>
                        <Typography.Link
                          onClick={() => {
                            navigate(`/apps/${appId}/users/${user.id}`);
                          }}
                        >
                          {t("check-user")}
                        </Typography.Link>
                      </Col>
                    ) : null}

                    <Col span={2}>
                      <Tooltip title={t("remove_from_group")}>
                        <Popconfirm
                          title={t("remove-from-group-confirmation", { groupName: "" })}
                          onConfirm={() => handleRemoveUserFromGroup(user.id)}
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
                </Col>
              );
            })}
          </Row>
        )}
      </div>
      {group?.nbUsers !== 0 ? (
        <Pagination
          style={{ alignSelf: "center" }}
          showSizeChanger={false}
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={(page) => setPage(page)}
        />
      ) : null}
    </Card>
  );
};

export default Users;
