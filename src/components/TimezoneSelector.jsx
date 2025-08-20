import { Input, Select } from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import logger from "@/logger";
import { useDebounce } from "use-debounce";
import moment from "moment-timezone";

import { API } from "@/services/features/AuthSlice";
import { useTranslation } from "react-i18next";
import { extractLocalizedString } from "@/helpers";

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
  const { i18n } = useTranslation();
  const lng = i18n.language.split("-")[0];
  0;

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
