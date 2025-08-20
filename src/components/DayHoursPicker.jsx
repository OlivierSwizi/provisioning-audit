import { TimePicker, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const DayHoursPicker = ({ value, onChange }) => {
  const { t } = useTranslation();
  const [start, setStart] = useState(dayjs("8:00", "HH:mm"));
  const [midDay, setMidDay] = useState(dayjs("13:00", "HH:mm"));
  const [end, setEnd] = useState(dayjs("18:00", "HH:mm"));

  useEffect(() => {
    if (!value) return;

    if (!value.morningHours || !value.afternoonHours) {
      value.morningHours = ["08:00:00", "12:59:59"];
      value.afternoonHours = ["13:00:00", "18:00:00"];
    }

    setStart(dayjs(value.morningHours[0], "HH:mm"));
    setMidDay(dayjs(value.afternoonHours[0], "HH:mm"));
    setEnd(dayjs(value.afternoonHours[1], "HH:mm"));
  }, [value]);

  const handleChange = (start, midDay, end) => {
    if (start.isSameOrAfter(midDay)) midDay = start.clone().add(1, "hours");
    if (midDay.isSameOrAfter(end)) end = midDay.clone().add(1, "hours");
    onChange({
      morningHours: [
        start.format("HH:mm:ss"),
        midDay.clone().subtract(1, "seconds").format("HH:mm:ss"),
      ],
      afternoonHours: [midDay.format("HH:mm:ss"), end.format("HH:mm:ss")],
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      <Typography.Text style={{ marginRight: "5px" }}>{t("day-start")}</Typography.Text>
      <TimePicker
        format="HH:mm"
        value={start}
        onChange={(v) => handleChange(v, midDay, end)}
        minuteStep={15}
      />
      <Typography.Text style={{ marginRight: "5px", marginLeft: "5px" }}>
        {t("day-start-afternoon")}
      </Typography.Text>
      <TimePicker
        format="HH:mm"
        value={midDay}
        onChange={(v) => handleChange(start, v, end)}
        minuteStep={15}
      />
      <Typography.Text style={{ marginRight: "5px", marginLeft: "5px" }}>
        {t("day-end")}
      </Typography.Text>
      <TimePicker
        format="HH:mm"
        value={end}
        onChange={(v) => handleChange(start, midDay, v)}
        minuteStep={15}
      />
    </div>
  );
};

export default DayHoursPicker;
