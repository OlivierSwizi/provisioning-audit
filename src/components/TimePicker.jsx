import { Select } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";

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

export default TimePicker;
