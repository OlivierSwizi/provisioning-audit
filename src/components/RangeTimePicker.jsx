import { Col, Row, Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const roundToNearestQuarter = (value) => {
  const m = dayjs(value, "HH:mm");
  const minutes = m.minute();
  const remainder = minutes % 15;
  if (remainder <= 7) {
    // round down
    return m.subtract(remainder, "minutes");
  } else {
    // round up
    return m.add(15 - remainder, "minutes");
  }
};

const RangeTimePicker = ({ value, onChange }) => {
  const { t } = useTranslation();

  const [currentStart, setCurrentStart] = useState(value);
  const [currentEnd, setCurrentEnd] = useState(value);

  const [options, setOptions] = useState([]);

  const dropdownStartRef = useRef(null);
  const dropdownEndRef = useRef(null);

  useEffect(() => {
    const options = [];
    let current = dayjs().startOf("day");
    while (current.isBefore(dayjs().endOf("day"))) {
      options.push({
        value: current.format("HH:mm"),
        label: current.format("HH:mm"),
      });
      current = current.add(30, "minutes");
    }
    setOptions(options);
  }, []);

  useEffect(() => {
    if (value) {
      if (value.start && !value.end)
        value.end = dayjs(value.start, "HH:mm").add(1, "hour").format("HH:mm");
      if (!value.start && value.end)
        value.start = dayjs(value.end, "HH:mm").subtract(1, "hour").format("HH:mm");
      setCurrentStart(dayjs(roundToNearestQuarter(value.start)).format("HH:mm"));
      setCurrentEnd(dayjs(roundToNearestQuarter(value.end)).format("HH:mm"));
    }
  }, [value]);

  useEffect(() => {
    if (dropdownStartRef.current) {
      const selectedOption = dropdownStartRef.current.querySelector(
        ".ant-select-item-option-selected",
      );
      if (selectedOption) {
        selectedOption.scrollIntoView({ block: "nearest" });
      }
    }
  }, [currentStart]);

  useEffect(() => {
    if (dropdownEndRef.current) {
      const selectedOption = dropdownEndRef.current.querySelector(
        ".ant-select-item-option-selected",
      );
      if (selectedOption) {
        selectedOption.scrollIntoView({ block: "nearest" });
      }
    }
  }, [currentEnd]);

  return (
    <Row style={{ width: "300px" }}>
      <Col span={10}>
        <Select
          value={currentStart}
          size="middle"
          style={{ width: "100px", textAlign: "center" }}
          onChange={(v) => {
            onChange({
              start: v,
              end: currentEnd,
            });
          }}
          dropdownRender={(menu) => <div ref={dropdownStartRef}>{menu}</div>}
        >
          {options.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Col>
      <Col
        span={2}
        style={{
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span>{t("to")}</span>
      </Col>
      <Col span={10} offset={2}>
        <Select
          value={currentEnd}
          size="middle"
          style={{ width: "100px", textAlign: "center" }}
          onChange={(v) => {
            onChange({
              start: currentStart,
              end: v,
            });
          }}
          dropdownRender={(menu) => <div ref={dropdownEndRef}>{menu}</div>}
        >
          {options.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Col>
    </Row>
  );
};

export default RangeTimePicker;
