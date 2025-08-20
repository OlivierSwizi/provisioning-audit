import { useTranslation } from "react-i18next";
import {
  Row,
  Col,
  Typography,
  message,
  Image,
  Pagination,
  Spin,
  Input,
  Select,
  Tooltip,
  Popconfirm,
  Button,
} from "antd";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import logger from "@/logger";

import { API } from "@/services/features/AuthSlice";
import { useSelectFileModal } from "@/components/modal/SelectFileModal";

import dayjs from "dayjs";

import { useDebounce } from "use-debounce";
import Glyph from "@/common/Glyph";
import useMediaCookie from "@/services/useMediaCookie";

const { Title } = Typography;

const LibraryView = () => {
  const { t } = useTranslation();
  const appId = useSelector((state) => state.apps.selectedApp.id);
  const api = useSelector(API);

  useMediaCookie();

  const [filter, setFilter] = useState("");
  const [sortType, setSortType] = useState("name"); // ["name", "date", "id"]
  const [sortOrder, setSortOrder] = useState("asc"); // ["asc", "desc"]
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [images, setImages] = useState([]);

  const [selectFile, SelectFileModal] = useSelectFileModal();

  const [debounceFilter] = useDebounce(filter, 500);

  const refresh = async (resetPagination = false) => {
    try {
      const result = await api.media.list(
        resetPagination ? 1 : page,
        pageSize,
        debounceFilter,
        sortType,
        sortOrder,
      );
      setImages(
        result.items.map((item) => ({ ...item, date: dayjs(item.createdAt).format("LLL") })),
      );
      setPage(parseInt(result.page));
      setTotal(result.totalItems);
      setPage(parseInt(result.page));
    } catch (error) {
      logger.error("Failed to load library", error);
      message.error(t("errorLoadingLibrary"));
    }
  };

  const onPageChange = (page, pageSize) => {
    setPage(page);
    setPageSize(pageSize);
  };

  useEffect(() => {
    if (!appId) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appId, page, pageSize, sortType]);

  useEffect(() => {
    refresh(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceFilter]);

  useEffect(() => {
    refresh(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder, sortType]);

  const SwiziImage = ({ media, onDelete = () => {}, onReplace = () => {} }) => {
    const [loading, setLoading] = useState(true);
    const [mouseIsHovered, setMouseIdHovered] = useState(false);

    return (
      <div
        style={{ position: "relative", widht: "100%", height: "100%" }}
        onMouseEnter={() => setMouseIdHovered(true)}
        onMouseLeave={() => setMouseIdHovered(false)}
      >
        {loading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Spin />
          </div>
        )}
        <Image
          width={380}
          src={api.media.getMediaUrl(appId, media.id, dayjs().toISOString())}
          onLoad={() => setLoading(false)}
          style={loading ? { display: "none" } : {}}
        />
        <div
          style={{
            position: "absolute",
            flexDirection: "column",
            bottom: 5,
            left: 0,
            width: "100%",
            textAlign: "center",
            background: "rgba(255, 255, 255, 0.7)",
            display: loading ? "none" : "flex",
          }}
        >
          <Typography.Text>{media.filename}</Typography.Text>
          <Typography.Text>{media.date}</Typography.Text>
        </div>
        <div
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            display: loading ? "none" : "flex",
            flexDirection: "column",
            background: "rgba(255, 255, 255, 0.7)",
            padding: "3px 3px 3px 3px",
          }}
        >
          <Typography.Text copyable>{media.id}</Typography.Text>
          {mouseIsHovered && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Tooltip title={t("delete-image")}>
                <Popconfirm
                  placement="top"
                  title={t("delete-image-confirm")}
                  onConfirm={onDelete}
                  okText={t("Yes")}
                  cancelText={t("No")}
                >
                  <Glyph
                    className={"ant-typography-copy"}
                    style={{ marginBottom: 5 }}
                    name={"delete_outline"}
                  />
                </Popconfirm>
              </Tooltip>
              <Tooltip title={t("replace-image")}>
                <Popconfirm
                  placement="top"
                  title={t("replace-image-confirm")}
                  onConfirm={onReplace}
                  okText={t("Yes")}
                  cancelText={t("No")}
                >
                  <Glyph className={"ant-typography-copy"} name={"refresh"} />
                </Popconfirm>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleDelete = async (image) => {
    try {
      await api.media.delete(image.id);
      message.success(t("image-deleted"));
      refresh();
    } catch (error) {
      logger.error("Failed to delete image", error);
      message.error(t("error-deleting-image"));
    }
  };

  const handleReplace = async (image) => {
    const file = await selectFile("image/*");
    if (!file) return;
    try {
      await api.media.replace(image.id, file);
      message.success(t("image-replaced"));
    } catch (error) {
      logger.error("Failed to replace image", error);
      message.error(t("error-replacing-image"));
    }
    refresh();
  };

  const handleAddMedia = async () => {
    const file = await selectFile("image/*");
    if (!file) return;
    try {
      await api.media.upload(file);
      message.success(t("image-uploaded"));
      refresh();
    } catch (error) {
      logger.error("Failed to upload file", error);
      message.error(t("error-uploading"));
    }
    setSortType("date");
    setSortOrder("desc");
  };

  return (
    <>
      {SelectFileModal}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={24}>
              <Row style={{ width: "100%" }}>
                <Col span={24}>
                  <Title level={3}>{t("library")}</Title>
                </Col>
                <Col span={6}>
                  <Pagination
                    showSizeChanger={false}
                    onChange={onPageChange}
                    current={page}
                    pageSize={pageSize}
                    total={total}
                  />
                </Col>
                <Col
                  offset={1}
                  span={4}
                  style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                >
                  <Typography.Text>{t("Filter")}</Typography.Text>
                  <Input
                    value={filter}
                    onChange={(v) => setFilter(v.target.value)}
                    size="middle"
                    style={{ width: "65%", marginLeft: "5px" }}
                  />
                </Col>
                <Col
                  span={4}
                  offset={1}
                  style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                >
                  <Typography.Text>{t("Sort by")}</Typography.Text>
                  <Select
                    onChange={(v) => setSortType(v)}
                    value={sortType}
                    style={{ marginLeft: "10px", width: "50%" }}
                    size="middle"
                  >
                    <Select.Option value="name">{t("Name")}</Select.Option>
                    <Select.Option value="date">{t("Date")}</Select.Option>
                    <Select.Option value="id">{t("Id")}</Select.Option>
                  </Select>
                </Col>
                <Col
                  span={3}
                  offset={1}
                  style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
                >
                  <Typography.Text>{t("Order")}</Typography.Text>
                  <Select
                    onChange={(v) => setSortOrder(v)}
                    value={sortOrder}
                    style={{ marginLeft: "10px", width: "60%" }}
                    size="middle"
                  >
                    <Select.Option value="asc">{t("Asc")}</Select.Option>
                    <Select.Option value="desc">{t("Desc")}</Select.Option>
                  </Select>
                </Col>
                <Col span={3} offset={1}>
                  <Button block onClick={handleAddMedia}>
                    {t("add-a-media")}
                  </Button>
                </Col>
                <Col span={24}>
                  <section style={{ marginTop: "16px", padding: "10px 0" }}>
                    <div
                      style={{
                        display: "grid",
                        gridGap: "10px",
                        gridTemplateColumns: "repeat(auto-fill, 380px)",
                      }}
                    >
                      {images.map((image) => (
                        <div
                          key={image.id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "10px",
                            border: "1px solid #e8e8e8",
                            borderRadius: "5px",
                          }}
                        >
                          <SwiziImage
                            media={image}
                            onDelete={() => handleDelete(image)}
                            onReplace={() => handleReplace(image)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default LibraryView;
