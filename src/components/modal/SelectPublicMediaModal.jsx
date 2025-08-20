/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Modal,
  Typography,
  Flex,
  Input,
  Divider,
  Button,
  Spin,
  Empty,
  Image,
  Pagination,
} from "antd";
import { UploadOutlined, EyeOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import useMediaCookie from "@/services/useMediaCookie";
import { useDebounce } from "use-debounce";
import { API } from "@/services/features/AuthSlice";
import { useSelector } from "react-redux";
import Masonry from "react-masonry-css";

// --- Config ---
const breakpointColumns = { default: 5, 1600: 5, 1280: 4, 992: 3, 768: 2, 480: 1 };
const GUTTER = 16; // px

// --- Small helpers ---
const MediaTile = ({ item, selected, onSelect, onPreview }) => {
  return (
    <div
      className="spm-tile"
      role="gridcell"
      aria-selected={selected}
      tabIndex={0}
      onClick={() => onSelect(item)}
      onDoubleClick={() => onPreview(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect(item);
      }}
      style={{
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: selected ? "0 0 0 2px #1677ff" : "0 1px 3px rgba(0,0,0,.08)",
        transition: "transform .15s ease, box-shadow .15s ease",
        cursor: "pointer",
      }}
    >
      <img
        src={item.thumbnailUrl || item.url}
        alt={item.filename || "media"}
        loading="lazy"
        decoding="async"
        style={{ width: "100%", display: "block" }}
      />

      {/* Filename caption */}
      <div style={{ padding: 8, borderTop: "1px solid rgba(0,0,0,.06)", background: "#fff" }}>
        <Typography.Text
          style={{ fontSize: 12, lineHeight: 1.2, display: "block" }}
          type="secondary"
          ellipsis
          title={item.filename}
        >
          {item.filename}
        </Typography.Text>
      </div>

      {/* Hover tools */}
      <div
        className="spm-overlay"
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: 8,
          background: "linear-gradient(to bottom, rgba(0,0,0,.18), rgba(0,0,0,0) 60%)",
          opacity: 0,
          transition: "opacity .15s ease",
        }}
      >
        <Button
          size="small"
          type="primary"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            onPreview(item);
          }}
        />
      </div>

      {selected ? (
        <CheckCircleTwoTone
          twoToneColor="#1677ff"
          style={{ position: "absolute", top: 8, left: 8, fontSize: 20 }}
        />
      ) : null}

      <style>
        {`.spm-tile:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.12); }
          .spm-tile:hover .spm-overlay { opacity: 1; }`}
      </style>
    </div>
  );
};

const Toolbar = ({ onSearch, onUpload }) => {
  const { t } = useTranslation();
  return (
    <div
      style={{ position: "sticky", top: 0, zIndex: 2, background: "#fff", padding: "8px 0 12px" }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Input.Search
          allowClear
          onSearch={onSearch}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t("spm-filter")}
          style={{ maxWidth: 280 }}
        />
        <div style={{ flex: 1 }} />
        <Button icon={<UploadOutlined />} onClick={onUpload}>
          {t("add-image-or-video")}
        </Button>
      </div>
    </div>
  );
};

const EmptyDropzone = ({ onFiles }) => {
  const { t } = useTranslation();
  const uploadingRef = useRef(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    if (uploadingRef.current) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    uploadingRef.current = true;
    await onFiles(files);
    uploadingRef.current = false;
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        border: "1px dashed rgba(0,0,0,.15)",
        borderRadius: 12,
        padding: 32,
        textAlign: "center",
        background: "#fafafa",
      }}
    >
      <Empty description={t("add-image-or-video")} />
      <Typography.Text type="secondary">
        {t("spm-drop-hint", { defaultValue: "Drag & drop files here" })}
      </Typography.Text>
    </div>
  );
};

const SelectPublicMediaModal = ({ isVisible, setIsVisible, promiseResolve }) => {
  useMediaCookie();
  const { t } = useTranslation();
  const api = useSelector(API);

  const [selected, setSelected] = useState();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [mediaList, setMediaList] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [debouncedFilter] = useDebounce(filter, 500);

  const filteredMedia = useMemo(() => {
    const byFilter = (m) => {
      if (!debouncedFilter) return true;
      const term = debouncedFilter.toLowerCase();
      return (
        (m.filename || "").toLowerCase().includes(term) ||
        (m.title || "").toLowerCase().includes(term)
      );
    };
    return mediaList.filter(byFilter);
  }, [mediaList, debouncedFilter]);

  const loadMedia = useCallback(
    async (overwritePage, overwritePageSize) => {
      if (!isVisible) return;
      setLoading(true);
      try {
        const medias = await api.media.listPublicMedias(
          overwritePage || page,
          overwritePageSize || pageSize,
          debouncedFilter,
        );
        setMediaList(medias.items || []);
        setPage(medias.page || page);
        setPageSize(medias.pageSize || pageSize);
        setTotal(medias.totalItems || 0);
      } finally {
        setLoading(false);
      }
    },
    [api, page, pageSize, debouncedFilter, isVisible],
  );

  useEffect(() => {
    if (!isVisible) return;
    loadMedia(1, 10);
    setSelected(null);
  }, [isVisible, loadMedia]);

  useEffect(() => {
    if (!isVisible) return;
    loadMedia();
  }, [page, pageSize, debouncedFilter, isVisible, loadMedia]);

  const handleSelect = () => {
    setIsVisible(false);
    promiseResolve(selected.url);
  };

  const handleCancel = () => {
    setIsVisible(false);
    promiseResolve();
  };

  const handleSelectFile = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.multiple = true;
    input.onchange = async (event) => {
      const files = Array.from(event.target.files || []);
      if (files.length) {
        for (const file of files) {
          await api.media.uploadAsset(file);
        }
        loadMedia();
      }
    };
    input.click();
  };

  const handleDropUpload = async (files) => {
    for (const file of files) {
      await api.media.uploadAsset(file);
    }
    await loadMedia();
  };

  const openPreview = useCallback(
    (item) => {
      const idx = filteredMedia.findIndex((m) => m.id === item.id);
      setPreviewIndex(Math.max(0, idx));
      setPreviewOpen(true);
    },
    [filteredMedia],
  );

  // Keyboard navigation (left/right/up/down)
  const gridRef = useRef(null);
  const onKeyDownGrid = (e) => {
    if (!filteredMedia.length) return;
    const currentIndex = selected ? filteredMedia.findIndex((m) => m.id === selected.id) : -1;

    const move = (delta) => {
      const next = Math.max(
        0,
        Math.min(filteredMedia.length - 1, (currentIndex === -1 ? 0 : currentIndex) + delta),
      );
      const item = filteredMedia[next];
      setSelected(item);
    };

    // crude estimate: columns based on breakpoints – good enough for keyboard nav
    const cols = Object.values(breakpointColumns)[0] || 4;

    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        move(1);
        break;
      case "ArrowLeft":
        e.preventDefault();
        move(-1);
        break;
      case "ArrowDown":
        e.preventDefault();
        move(cols);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-cols);
        break;
      case "Enter":
        if (selected) handleSelect();
        break;
      default:
        break;
    }
  };

  return (
    <Modal
      open={isVisible}
      onOk={handleSelect}
      onCancel={handleCancel}
      width={1000}
      okButtonProps={{ style: { width: 180 }, disabled: !selected }}
      cancelButtonProps={{ style: { width: 180 } }}
      title={t("spm-title")}
    >
      <Flex vertical>
        {/* Help zone under title */}
        <Typography.Paragraph type="secondary" style={{ margin: "0 0 12px" }}>
          {t("spm-help")}
        </Typography.Paragraph>

        {/* Toolbar (sticky) */}
        <Toolbar
          onSearch={(v) => {
            setFilter(v);
            setPage(1);
          }}
          onUpload={handleSelectFile}
        />

        <Divider style={{ margin: "8px 0 16px" }} />

        {/* Content */}
        {loading ? (
          <div style={{ display: "grid", placeItems: "center", height: 320 }}>
            <Spin />
          </div>
        ) : filteredMedia.length === 0 ? (
          <EmptyDropzone onFiles={handleDropUpload} />
        ) : (
          <>
            <div
              ref={gridRef}
              role="grid"
              aria-multiselectable={false}
              tabIndex={0}
              onKeyDown={onKeyDownGrid}
            >
              <Masonry
                breakpointCols={breakpointColumns}
                className="spm-masonry"
                columnClassName="spm-masonry-col"
              >
                {filteredMedia.map((m) => (
                  <div key={m.id} style={{ marginBottom: GUTTER }}>
                    <MediaTile
                      item={m}
                      selected={selected?.id === m.id}
                      onSelect={setSelected}
                      onPreview={openPreview}
                    />
                  </div>
                ))}
              </Masonry>
              <style>
                {`
                .spm-masonry { display: flex; margin-left: -${GUTTER}px; width: auto; }
                .spm-masonry-col { padding-left: ${GUTTER}px; background-clip: padding-box; }
                .spm-masonry-col > .spm-tile { margin-bottom: ${GUTTER}px; }
              `}
              </style>
            </div>
            {total > pageSize ? (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger
                  onChange={(p, ps) => {
                    setPage(p);
                    setPageSize(ps);
                  }}
                />
              </div>
            ) : null}
          </>
        )}

        {/* Selected media URL (copyable) */}

        <Divider style={{ margin: "16px 0" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {selected?.url ? (
            <>
              {" "}
              <Typography.Text strong>
                {t("spm-selected-url", { defaultValue: "Selected media URL:" })}
              </Typography.Text>
              <Typography.Text copyable={{ text: selected.url }}>{selected.url}</Typography.Text>
            </>
          ) : (
            <Typography.Text>
              {t("spm-no-selected-url", { defaultValue: "No media selected" })}
            </Typography.Text>
          )}
        </div>

        {/* Controlled Preview Group */}
        <Image.PreviewGroup
          preview={{
            visible: previewOpen,
            onVisibleChange: (v) => setPreviewOpen(v),
            current: previewIndex,
            onChange: (idx) => setPreviewIndex(idx),
          }}
        >
          {filteredMedia.map((m) => (
            <Image
              key={`hidden-${m.id}`}
              src={m.url}
              alt={m.filename || "media"}
              style={{ display: "none" }}
            />
          ))}
        </Image.PreviewGroup>
      </Flex>
    </Modal>
  );
};

export default SelectPublicMediaModal;

export const useSelectPublicMediaModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);

  const askSelect = () => {
    setIsVisible(true);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    askSelect,

    <SelectPublicMediaModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
    />,
  ];
};
