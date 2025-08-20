import { Select, Tag } from "antd";
import { useEffect, useState } from "react";
import { API } from "@/services/features/AuthSlice";
import { useSelector } from "react-redux";

const MultiRoomTypesSelector = ({ value, onChange, disabled = false, siteId }) => {
  const [roomTypesList, setRoomTypesList] = useState([]);

  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);

  useEffect(() => {
    if (!siteId) return;
    load();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, onChange, appId]);

  const load = async () => {
    const list = await api.sites.listRoomTypes(siteId);
    setRoomTypesList(list);
  };

  const tagLinkRender = (props) => {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <Tag
        color={"cyan"}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{
          margin: "3px 3px 3px 3px",
        }}
        disabled={disabled}
      >
        {label}
      </Tag>
    );
  };

  return (
    <Select
      mode="multiple"
      size="large"
      tagRender={tagLinkRender}
      value={value}
      style={{ width: "95%", padding: "10px 10px 10px 10px" }}
      onChange={(links) => {
        onChange(links);
      }}
      disabled={disabled}
    >
      {(roomTypesList || [])
        .sort((v1, v2) => (v1.label < v2.label ? -1 : 1))
        .map((rt) => (
          <Select.Option key={rt.id} value={rt.id}>
            {rt.label}
          </Select.Option>
        ))}
    </Select>
  );
};

export default MultiRoomTypesSelector;
