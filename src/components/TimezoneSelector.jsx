import { Select } from "antd";
import moment from "moment-timezone";


const TIME_ZONES = moment.tz
  .names()
  .map((zone) => {
    const offset = moment.tz(zone).utcOffset() / 60;
    return {
      key: zone,
      value: `(GMT${offset >= 0 ? `+${offset}` : offset}) ${zone}`,
    };
  })
  .sort((a, b) => a.value.localeCompare(b.value));

const TimezoneSelector = ({ value, onChange }) => {
  return (
    <Select style={{ width: "100%" }} value={value} onChange={onChange}>
      {TIME_ZONES.map((item) => (
        <Select.Option key={item.key} value={item.key}>
          {item.value}
        </Select.Option>
      ))}
    </Select>
  );
};

export default TimezoneSelector;
