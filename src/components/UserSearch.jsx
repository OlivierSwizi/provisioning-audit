import { Select } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "@/services/features/AuthSlice";
import { useDebounce } from "use-debounce";
import helpers from "@/helpers";

const UserSearch = ({
  value,
  onChange,
  disabled = false,
  mode,
  size = "small",
  showEmail = false,
}) => {
  const [options, setOptions] = useState([]);
  const api = useSelector(API);

  const [searchUserText, setSearchUserText] = useState("");
  const [internalValue, setInternalValue] = useState();

  const [debounceText] = useDebounce(searchUserText, 500);

  useEffect(() => {
    const doIt = async () => {
      if (debounceText) {
        const users = await api.users.listUsers(1, 5, debounceText);
        setOptions(
          (users?.items || [])
            .map((user) => ({
              value: user.id,
              label: helpers.formatUserName(user),
              key: user.id,
              lastname: user.lastname,
              firstname: user.firstname,
              email: user.email,
            }))
            .filter((u) => !!u.label),
        );
      } else setOptions([]);
    };

    doIt();
  }, [api, debounceText]);

  const onSearch = (text) => {
    setSearchUserText(text);
  };

  useEffect(() => {
    if (value) {
      setInternalValue({
        key: value.id,
        label: value.lastname + " " + value.firstname,
        value: value.id,
        lastname: value.lastname,
        firstname: value.firstname,
      });
    } else {
      setInternalValue();
    }
    setOptions([]);
  }, [value]);

  const onChangeInternal = (value) => {
    setInternalValue(value);
    const newUser = options.find((u) => u.value === value.value);
    onChange({
      id: newUser.key,
      lastname: newUser.lastname,
      firstname: newUser.firstname,
    });
  };

  return (
    <Select
      showSearch
      labelInValue
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      value={internalValue}
      onChange={onChangeInternal}
      onSearch={onSearch}
      mode={mode}
      size={size}
      notFoundContent={null}
      options={undefined}
      disabled={disabled}
      dropdownRender={(menu) => menu}
      optionLabelProp="label"
    >
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value} label={option.label}>
          <div>
            <div>{option.label}</div>
            {showEmail && option.email && (
              <div style={{ fontSize: "0.85em", color: "#888" }}>{option.email}</div>
            )}
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};

export default UserSearch;
