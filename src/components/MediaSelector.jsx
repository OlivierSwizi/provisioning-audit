import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import logger from "@/logger";
import { API } from "@/services/features/AuthSlice";
import { startWorking, stopWorking } from "@/services/features/UISlice";
import { Button, Empty, Image, message } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { useSelectFileModal } from "@/components/modal/SelectFileModal";
import useMediaCookie from "@/services/useMediaCookie";

const MediaSelector = ({ value, onChange }) => {
  useMediaCookie();
  const { t } = useTranslation();
  const api = useSelector(API);
  const dispatch = useDispatch();

  const appId = useSelector((state) => state.apps.selectedApp.id);

  const [headerUrl, setHeaderUrl] = useState(null);

  const [selectFile, SelectFileModal] = useSelectFileModal();

  useEffect(() => {
    const doIt = async () => {
      if (!value) return setHeaderUrl(null);

      const url = api.media.getMediaUrl(appId, value);
      setHeaderUrl(url);
    };
    doIt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSelectFile = async () => {
    const file = await selectFile("image/*");
    try {
      if (!file) return;
      await dispatch(startWorking());
      const { id } = await api.media.upload(file, "site-header");
      onChange(id);
    } catch (error) {
      logger.error("Failed to upload file", error);
      message.error(t("components.upload-error"));
    } finally {
      await dispatch(stopWorking());
    }
  };

  return (
    <div style={{ height: 102, width: 258, marginBottom: 12, position: "relative" }}>
      {SelectFileModal}
      <div style={{ position: "absolute", bottom: 12, right: 12, zIndex: 2 }}>
        <Button size="small" icon={<SwapOutlined />} type="primary" onClick={handleSelectFile} />
      </div>
      {value ? (
        <Image width={258} height={102} src={headerUrl} />
      ) : (
        <Empty
          image={<div style={{ height: 60, backgroundColor: "#f0f0f0" }} />}
          description={<span>{t("components.no-header")}</span>}
        />
      )}
    </div>
  );
};

export default MediaSelector;
