/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect, useRef } from "react";

const SelectFileModal = ({ accept = "image/*", isVisible, setIsVisible, promiseResolve }) => {
  const fileInput = useRef(null);

  useEffect(() => {
    if (isVisible) {
      fileInput.current.click();
    }
  }, [isVisible]);

  const handleFileSelected = (event) => {
    const file = event.target.files[0];
    event.target.value = null;
    if (!file) return promiseResolve(null);

    setIsVisible(false);
    promiseResolve(file);
  };

  return (
    <input
      type="file"
      ref={fileInput}
      style={{ display: "none" }}
      onChange={handleFileSelected}
      accept={accept}
    />
  );
};

export default SelectFileModal;

export const useSelectFileModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);
  const [accept, setAccept] = useState("image/*");

  const prompt = (accept) => {
    setIsVisible(true);
    setAccept(accept);

    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    prompt,

    <SelectFileModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
      accept={accept}
    />,
  ];
};
