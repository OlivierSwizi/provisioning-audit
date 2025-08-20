import { useTranslation } from "react-i18next";

import { Row, Col, DatePicker, Select, message } from "antd";
import dayjs from "dayjs";
import { useState, useEffect, useRef } from "react";

const roundToNearestQuarter = (m = dayjs()) => {
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

const TimePicker = ({ value, onChange }) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [options, setOptions] = useState([]);

  const dropdownRef = useRef(null);

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
      setCurrentValue(dayjs(roundToNearestQuarter(value)).format("HH:mm"));
    }
  }, [value]);

  useEffect(() => {
    if (dropdownRef.current) {
      const selectedOption = dropdownRef.current.querySelector(".ant-select-item-option-selected");
      if (selectedOption) {
        selectedOption.scrollIntoView({ block: "nearest" });
      }
    }
  }, [currentValue]);

  return (
    <Select
      value={currentValue}
      size="middle"
      style={{ width: "100px" }}
      onChange={(v) => {
        onChange(dayjs(v, "HH:mm"));
      }}
      dropdownRender={(menu) => <div ref={dropdownRef}>{menu}</div>}
    >
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          {option.label}
        </Select.Option>
      ))}
    </Select>
  );
};

const RangePicker = ({ value, onChange }) => {
  const { t } = useTranslation();

  const [start, setStart] = useState(dayjs());
  const [end, setEnd] = useState(dayjs().add(1, "hour"));
  const [day, setDay] = useState(dayjs());

  useEffect(() => {
    if (value) {
      setStart(dayjs(value.start));
      setEnd(dayjs(value.end));
      setDay(dayjs(value.start));
    }
     
  }, [value]);

  const handleChange = (toUpdate) => {
    toUpdate = { start, end, day, ...toUpdate };
    const newStart = dayjs()
      .year(toUpdate.day.year())
      .month(toUpdate.day.month())
      .date(toUpdate.day.date())
      .hour(toUpdate.start.hour())
      .minute(toUpdate.start.minute())
      .second(0);
    const newEnd = dayjs()
      .year(toUpdate.day.year())
      .month(toUpdate.day.month())
      .date(toUpdate.day.date())
      .hour(toUpdate.end.hour())
      .minute(toUpdate.end.minute())
      .second(0);

    if (newEnd.isSameOrBefore(newStart)) {
      message.error(t("end-time-before-start"));
      return;
    }

    onChange({
      start: newStart,
      end: newEnd,
    });
  };

  return (
    <Row style={{ with: "100%" }}>
      <Col span={8} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <DatePicker
          value={day}
          onChange={(day) => {
            handleChange({ day: day.clone() });
          }}
          allowClear={false}
          size="middle"
        />
      </Col>
      <Col
        span={16}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px 0 10px",
        }}
      >
        <TimePicker
          value={start}
          onChange={(d) => {
            if (d.isSameOrAfter(end)) {
              setEnd(d.clone().add(35, "minutes"));
            }
            handleChange({ start: d });
          }}
        />
        <p style={{ margin: 0 }}>{t("to")}</p>
        <TimePicker
          value={end}
          onChange={(d) => {
            if (d.isSameOrBefore(start)) {
              setStart(d.clone().subtract(35, "minutes"));
            }
            handleChange({ end: d });
          }}
        />
      </Col>
      <Col span={8}></Col>
    </Row>
  );
};

export default RangePicker;
