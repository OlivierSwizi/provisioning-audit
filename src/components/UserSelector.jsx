import { Select } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "@/services/features/AuthSlice";
import { useDebounce } from "use-debounce";

const UserSelector = ({ value, onChange, style = {}, mode, size = "small" }) => {
  const [options, setOptions] = useState([]);
  const api = useSelector(API);
  const [searchUserText, ] = useState("");

  const [debouncedText] = useDebounce(searchUserText, 500);

  useEffect(() => {
    const doIt = async () => {
      const users = await api.users.listUsers(1, 5, debouncedText);
      setOptions(
        (users?.items || []).map((user) => ({
          value: user.id,
          label: user.lastname + " " + user.firstname,
        })),
      );
    };

    doIt();
     
  }, [api, debouncedText]);

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      style={style}
      mode={mode}
      size={size}
    />
  );
};

export default UserSelector;
