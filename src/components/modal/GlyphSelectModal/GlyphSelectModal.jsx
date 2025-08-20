/* eslint-disable react-refresh/only-export-components */

import { useEffect, useState } from "react";
import { Modal, Row, Input } from "antd";
import "@/common/Glyph.scss";
import cx from "clsx";
import iconList from "./iconList.json";

const GlyphSelectModal = ({
  promiseResolve,
  isVisible,
  setIsVisible,
  fontFamily = "Swizi-Glyphicons",
}) => {
  const [search, setSearch] = useState("");
  const [filteredIconList, setFilteredIconList] = useState(iconList);
  const style = { cursor: "pointer", margin: "5px" };

  useEffect(() => {
    if (!search) {
      setFilteredIconList(iconList);
      return;
    } else {
      const filtered = iconList.filter((icon) => icon.includes(search));
      setFilteredIconList(filtered);
    }
  }, [search]);

  const handleSelect = (icon) => {
    promiseResolve(icon);
    setIsVisible(false);
  };

  return (
    <div style={{ fontFamily }}>
      <Modal
        width={800}
        open={isVisible}
        onCancel={() => setIsVisible(false)}
        footer={null}
        style={{ maxHeight: "350px" }}
      >
        <Row style={{ marginTop: "25px", marginBottom: "25px", width: "100%" }}>
          <Input autoComplete="off" value={search} onChange={(v) => setSearch(v.target.value)} />
        </Row>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
            maxHeight: "550px",
          }}
        >
          {filteredIconList.map((icon, index) => (
            <div
              style={{
                textAlign: "center",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
              key={index}
              onClick={() => {
                handleSelect(icon);
              }}
            >
              <i className={cx("glyph")} style={style}>
                {icon}
              </i>
              <i style={{ fontSize: "10px", textOverflow: "ellipsis", width: "80px" }}>{icon}</i>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default GlyphSelectModal;

export const useGlyphModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [promiseResolve, setPromiseResolve] = useState(null);

  const selectGlyph = () => {
    setIsVisible(true);
    return new Promise((resolve) => {
      setPromiseResolve(() => resolve);
    });
  };

  return [
    selectGlyph,

    <GlyphSelectModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      promiseResolve={promiseResolve}
    />,
  ];
};
