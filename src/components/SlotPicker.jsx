import { TimePicker, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const SlotPicker = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [start, setStart] = useState(dayjs());
  const [end, setEnd] = useState(dayjs());

  useEffect(() => {
    if (!value) return;

    setStart(dayjs(value[0], "HH:mm"));
    setEnd(dayjs(value[1], "HH:mm"));
  }, [value]);

  const handleChange = (start, end) => {
    if (start.format("HH:mm") === end.format("HH:mm")) {
      end = end.add(5, "minutes");
    }
    if (start && end) onChange([start.format("HH:mm"), end.format("HH:mm")]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <Typography.Text style={{ marginRight: "5px" }}>{t("components.from")}</Typography.Text>
      <TimePicker
        format="HH:mm"
        value={start}
        onChange={(v) => handleChange(v, end)}
        minuteStep={15}
      />
      <Typography.Text style={{ marginRight: "5px", marginLeft: "5px" }}>{t("components.to")}</Typography.Text>
      <TimePicker
        format="HH:mm"
        value={end}
        onChange={(v) => handleChange(start, v)}
        minuteStep={15}
      />
    </div>
  );
};

export default SlotPicker;
