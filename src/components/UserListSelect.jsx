import { AutoComplete, Button, Card, Col, List, Row } from "antd";
import Glyph from "@/common/Glyph";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useDebounce } from "use-debounce";
import { API } from "@/services/features/AuthSlice";
import helpers from "@/helpers";

const UserListSelect = ({ value = [], onChange, userListStyle = {}, idField = "id" }) => {
  const { t } = useTranslation();

  const api = useSelector(API);

  const [searchUserText, setSearchUserText] = useState("");

  const [debouncedText] = useDebounce(searchUserText, 500);
  const [selectedUser, setSelectedUser] = useState();
  const [userCompletionList, setUserCompletionList] = useState([]);

  const [userList, setUserList] = useState([]);

  const valueRef = useRef();

  const handleRemove = (user) => {
    onChange(value.filter((item) => item !== user.value));
    setSearchUserText("");
    setSelectedUser();
    setUserCompletionList([]);
  };

  useEffect(() => {
    const doIt = async () => {
      if (!debouncedText) return;
      const users = await api.users.listUsers(1, 5, debouncedText);
      setUserCompletionList(
        users.items.map((user) => ({
          value: user[idField],
          label: helpers.formatUserNameEmail(user),
        })),
      );
    };
    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedText]);

  useEffect(() => {
    if (JSON.stringify(valueRef.current) === JSON.stringify(value)) return;
    valueRef.current = value;

    const doIt = async () => {
      const users =
        valueRef.current.length === 0
          ? []
          : idField === "id"
            ? await api.users.getUsersFromIdList(valueRef.current)
            : await api.users.getUsersFromEmailList(valueRef.current);
      setUserList(
        users
          .map((user) => ({ value: user[idField], label: helpers.formatUserName(user) }))
          .sort((a, b) => a.label.localeCompare(b.label)),
      );
    };
    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleAdd = () => {
    if (!selectedUser) return;
    if (value.includes(selectedUser.value)) return;

    onChange([...value, selectedUser.value]);
    setSearchUserText("");
    setSelectedUser();
    setUserCompletionList([]);
  };

  const onSelect = (value) => {
    const user = userCompletionList.find((item) => item.value === value);
    setSelectedUser(user);
    setSearchUserText(user.label);
  };

  return (
    <Card style={{ padding: 20, width: "100%" }} bordered={true}>
      <Row style={{ height: "50px" }}>
        <Col span={20} style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <AutoComplete
            placeholder={t("search-user")}
            options={userCompletionList}
            allowClear
            onSearch={setSearchUserText}
            onSelect={onSelect}
            value={searchUserText}
            style={{ width: "100%" }}
          />
        </Col>

        <Col span={2} offset={1} style={{ display: "flex", alignItems: "center", height: "100%" }}>
          <Button
            onClick={handleAdd}
            size="small"
            style={{ width: "75px" }}
            disabled={!selectedUser}
          >
            {t("add")}
          </Button>
        </Col>
      </Row>
      <Row style={userListStyle}>
        <Col span={24}>
          <List
            dataSource={userList}
            locale={{
              emptyText: <div />,
            }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Glyph
                    key="delete"
                    className={"secondary clickable"}
                    name={"delete"}
                    onClick={() => handleRemove(item)}
                  />,
                ]}
              >
                {item.label}
              </List.Item>
            )}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default UserListSelect;
