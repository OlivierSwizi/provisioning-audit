import { PlusOutlined } from "@ant-design/icons";
import { Flex, Input, Tag, theme, Tooltip } from "antd";
import { useEffect, useRef, useState } from "react";

const tagInputStyle = {
  width: 64,
  height: 22,
  marginInlineEnd: 8,
  verticalAlign: "top",
};

const EquipmentList = ({ value, onChange }) => {
  const { token } = theme.useToken();
  const [currentValue, setCurrentValue] = useState([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState("");
  const inputRef = useRef(null);
  const editInputRef = useRef(null);

  useEffect(() => {
    var _a;
    if (inputVisible) {
      (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    }
  }, [inputVisible]);

  useEffect(() => {
    var _a;
    (_a = editInputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
  }, [editInputValue]);

  useEffect(() => {
    if (!value) {
      setCurrentValue([]);
    } else {
      setCurrentValue(value.map((v) => v.title));
    }
  }, [value]);

  const update = (newTags) => {
    onChange(newTags.map((tag) => ({ icon: "", title: tag })));
  };

  const handleClose = (removedTag) => {
    const newTags = currentValue.filter((tag) => tag !== removedTag);
    update(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  const handleInputConfirm = () => {
    if (inputValue && !currentValue.includes(inputValue)) {
      update([...currentValue, inputValue]);
    }
    setInputVisible(false);
    setInputValue("");
  };
  const handleEditInputChange = (e) => {
    setEditInputValue(e.target.value);
  };
  const handleEditInputConfirm = () => {
    const newTags = [...currentValue];
    newTags[editInputIndex] = editInputValue;
    update(newTags);
    setEditInputIndex(-1);
    setEditInputValue("");
  };
  const tagPlusStyle = {
    height: 22,
    background: token.colorBgContainer,
    borderStyle: "dashed",
  };
  return (
    <Flex gap="4px 0" wrap>
      {currentValue.map((tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={tag}
              size="small"
              style={tagInputStyle}
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          );
        }
        const isLongTag = tag.length > 20;
        const tagElem = (
          <Tag
            key={tag}
            closable={true}
            style={{ userSelect: "none" }}
            onClose={() => handleClose(tag)}
          >
            <span
              onDoubleClick={(e) => {
                if (index !== 0) {
                  setEditInputIndex(index);
                  setEditInputValue(tag);
                  e.preventDefault();
                }
              }}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </span>
          </Tag>
        );
        return isLongTag ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        );
      })}
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={tagInputStyle}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
          Nouveau
        </Tag>
      )}
    </Flex>
  );
};

export default EquipmentList;
