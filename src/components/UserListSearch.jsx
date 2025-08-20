import { Button, Modal, Select, Space, Tooltip, message } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "@/services/features/AuthSlice";
import { useDebounce } from "use-debounce";
import Glyph from "@/common/Glyph";
import { useTranslation } from "react-i18next";
import { useSelectGroupModal } from "@/components/modal/SelectGroupModal";
import logger from "@/logger";

const UserListSearch = ({ value, onChange, disabled = false, style = {} }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState([]);
  const api = useSelector(API);
  const [searchUserText, setSearchUserText] = useState("");
  const [internalValues, setInternalValues] = useState(value);
  const [userList, setUserList] = useState([]);

  const [selectGroupModal, SelectGroupModal] = useSelectGroupModal();

  const [debounceText] = useDebounce(searchUserText, 500);

  const handleAddGroup = async () => {
    try {
      const groupId = await selectGroupModal();
      if (groupId) {
        const groupContentInfo = await api.groups.usersOfGroup(groupId, 1, 1, "");
        if (groupContentInfo.totalItems === 0) {
          return message.info(t("components.group-has-no-users"));
        } else {
          await Modal.confirm({
            title: t("components.confirm"),
            content: t("components.copy-group-confirm", { count: groupContentInfo.totalItems }),
            onOk: async () => {
              const userList = await api.groups.usersOfGroup(
                groupId,
                1,
                groupContentInfo.totalItems,
                "",
              );
              const users = value || [];
              userList.items.forEach((user) => {
                if (!users.includes(user.id)) {
                  users.push({
                    key: user.id,
                    label: user.lastname + " " + user.firstname,
                    value: user.id,
                    lastname: user.lastname,
                    firstname: user.firstname,
                  });
                }
              });

              onChange(
                users.map((u) => ({ id: u.value, firstname: u.firstname, lastname: u.lastname })),
              );
            },
          });
        }
      }
    } catch (e) {
      logger.error(e);
      message.error(t("components.error-copying-group"));
    }
  };

  useEffect(() => {
    const lInternalValues = (value || []).map((u) => ({
      key: u.id,
      label: u.lastname + " " + u.firstname,
      value: u.id,
      lastname: u.lastname,
      firstname: u.firstname,
    }));

    const lUserList = userList || [];
    lInternalValues.forEach((u) => {
      if (!lUserList.includes((ul) => ul.value === u.value)) {
        lUserList.push(u);
      }
    });
    setUserList(lUserList);
    setInternalValues(lInternalValues);
    setOptions([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const doIt = async () => {
      if (debounceText) {
        const users = await api.users.listUsers(1, 5, debounceText);
        const lOptions = (users?.items || []).map((user) => ({
          value: user.id,
          label: user.lastname + " " + user.firstname,
          lastname: user.lastname,
          firstname: user.firstname,
        }));
        setOptions(lOptions);
        const lUserList = userList || [];
        lOptions.forEach((u) => {
          if (!lUserList.includes((ul) => ul.value === u.value)) {
            lUserList.push(u);
          }
        });
        setUserList(lUserList);
      } else setOptions([]);
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, debounceText]);

  const onSearch = (text) => {
    setSearchUserText(text);
  };

  const onInternalChange = (value) => {
    const newValue = [];
    if (value) {
      value.forEach((v) => {
        const user = userList.find((u) => u.value === v.value);
        if (user)
          newValue.push({ id: user.value, firstname: user.firstname, lastname: user.lastname });
      });
      onChange(newValue);
    }
  };

  return (
    <div style={{ ...style, display: "flex", flexDirection: "row" }}>
      {SelectGroupModal}
      <Select
        showSearch
        tokenSeparators={[","]}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        value={internalValues}
        onChange={onInternalChange}
        onSearch={onSearch}
        style={{ ...style }}
        mode="tags"
        size={"medium"}
        notFoundContent={null}
        options={options}
        labelInValue
        className="custom-users-select"
        disabled={disabled}
      />
      {disabled ? null : (
        <Tooltip title={t("components.copy-from-group")}>
          <Button
            type="primary"
            style={{ marginLeft: "10px", float: "right" }}
            size="small"
            onClick={handleAddGroup}
          >
            <Space size="small">
              <Glyph name={"group_add"} style={{ fontSize: "18px" }} />
            </Space>
          </Button>
        </Tooltip>
      )}
    </div>
  );
};

export default UserListSearch;
