import axios from "axios";
import { useEffect, useState } from "react";

import { Row, Col, InputNumber, Select, Button, Input, Spin } from "antd";
import logger from "@/logger";

const { TextArea } = Input;

const DPMM_OPTIONS = [
  {
    value: 8,
    label: "8 (203 DPI)",
  },
  {
    value: 12,
    label: "12 (300 DPI)",
  },
  {
    value: 24,
    label: "24 (600 DPI)",
  },
];

const ZplEditor = ({ value, onChange }) => {
  const [image, setImage] = useState(null);
  const [dppmm, setDppmm] = useState(8);
  const [width, setWidth] = useState(3.34);
  const [height, setHeight] = useState(2);
  const [isFetching, setIsFetching] = useState(false);

  const handleApply = async () => {
    try {
      setIsFetching(true);
      const response = await axios.post(
        `https://api.labelary.com/v1/printers/${dppmm}dpmm/labels/${width}x${height}/0/`,
        value,
        {
          responseType: "blob",
        },
      );
      setImage(URL.createObjectURL(new Blob([response.data])));
    } catch (e) {
      logger.error("error", e);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    handleApply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Row style={{ width: "100%", height: "100%" }}>
      <Col span={12}>
        <TextArea
          style={{ width: "100%", minHeight: "50vh" }}
          value={value || ""}
          onChange={onChange}
        />
      </Col>
      <Col span={12}>
        <Row style={{ height: "30vh" }}>
          <Col offset={1} span={23}>
            {isFetching ? (
              <Spin />
            ) : (
              <img src={image} alt="preview" style={{ width: "100%", border: "solid 1px black" }} />
            )}
          </Col>
        </Row>
        <Row>
          <Col offset={1} span={23}>
            <div>DPPMM</div>
            <Select value={dppmm} onChange={(value) => setDppmm(value)} options={DPMM_OPTIONS} />
          </Col>
        </Row>
        <Row style={{ marginTop: "20px" }}>
          <Col offset={1} span={11}>
            <div>Width</div>
            <InputNumber
              style={{ width: "100%" }}
              value={width}
              onChange={(value) => setWidth(value)}
            />
          </Col>
          <Col offset={1} span={11}>
            <div>Height</div>
            <InputNumber
              style={{ width: "100%" }}
              value={height}
              onChange={(value) => setHeight(value)}
            />
          </Col>
        </Row>
        <Row style={{ marginTop: "20px" }}>
          <Col offset={3} span={20}>
            <Button block type="secondaru" onClick={handleApply}>
              Actualiser la preview
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default ZplEditor;
