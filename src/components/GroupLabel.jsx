import { Typography } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { API } from "@/services/features/AuthSlice";

const GroupLabel = ({ value }) => {
  const api = useSelector(API);
  const [groupName, setGroupName] = useState(null);

  useEffect(() => {
    const doIt = async () => {
      const groups = await api.groups.listGroups();
      if (groups && Array.isArray(groups)) {
        setGroupName(groups.find((group) => group.id === value)?.label || "no name");
      }
    };

    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, value]);

  return <Typography.Text>{groupName}</Typography.Text>;
};

export default GroupLabel;
