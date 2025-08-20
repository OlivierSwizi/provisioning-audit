/* eslint-disable react-refresh/only-export-components */

import  { useState, useEffect } from "react";
import { Modal, Input } from "antd";
import TextArea from "antd/lib/input/TextArea";

const PromptModal = ({
  placeholder = "",
  title = "",
  options,
  isVisible,
  setIsVisible,
  promiseResolve,
}) => {
  const [value, setValue] = useState(options?.default || "");

  useEffect(() => {
    if (isVisible) {
      setValue(options?.default || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleOk = () => {
    setIsVisible(false);
    promiseResolve(value);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  return (
    <Modal open={isVisible} onOk={handleOk} onCancel={handleCancel} title={title}>
      {options?.type === "textarea" ? (
        <TextArea
          style={{ marginTop: "15px" }}
          placeholder={placeholder}
          value={value}
          autoSize={{
            minRows: 2,
            maxRows: 6,
          }}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <Input
          style={{ marginTop: "15px" }}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
    </Modal>
  );
};

export default PromptModal;

export const usePromptModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);
  const [placeholder, setPlaceholder] = useState("");
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState({ default: "", type: "input" });

  const prompt = (placeholder, title, options = { default: "", type: "input" }) => {
    setIsVisible(true);
    setPlaceholder(placeholder);
    setTitle(title);
    if (typeof options === "string") {
      options = { default: options, type: "input" };
    }
    setOptions(options);

    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
       prompt,
    // eslint-disable-next-line react/jsx-key
    <PromptModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      placeholder={placeholder}
      title={title}
      options={options}
    />,
  ];
};
