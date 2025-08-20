import { Button, Flex, TimePicker } from "antd";
import { useMemo } from "react";

import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

const OpeningHoursSelector = ({ value = [], onChange }) => {
  const { i18n } = useTranslation();
  const lng = i18n.language.split("-")[0];

  const weekDays = useMemo(() => {
    return [
      i18n.t("monday", { lng }),
      i18n.t("tuesday", { lng }),
      i18n.t("wednesday", { lng }),
      i18n.t("thursday", { lng }),
      i18n.t("friday", { lng }),
      i18n.t("saturday", { lng }),
      i18n.t("sunday", { lng }),
    ];
  }, [i18n, lng]);

  const addSlotToDay = (day) => {
    const newValue = [...(value[day] || [])];
    newValue.push([
      dayjs().startOf("day").format("HH:mm"),
      dayjs().startOf("day").add(1, "hour").format("HH:mm"),
    ]);
    const updatedValue = [...value];
    updatedValue[day] = newValue;
    onChange(updatedValue);
  };

  const updateDay = (day, newValue) => {
    const updatedValue = [...value];
    if (newValue && newValue[day]) {
      updatedValue[day] = newValue[day].filter((slot) => slot && slot.length === 2);
    } else {
      delete updatedValue[day];
    }
    onChange(updatedValue);
  };

  const Day = ({ day, onAdd, onChange }) => (
    <Flex vertical={false} gap={4}>
      <span style={{ width: "150px" }}>{weekDays[day]}</span>
      <span>
        <Flex vertical={true} gap={4}>
          {(value[day] || []).map((time, index) => (
            <Flex key={`${index}`} gap={4} vertical={false}>
              <TimePicker
                value={dayjs(time[0], "HH:mm")}
                size="small"
                format="HH:mm"
                showNow={false}
                onChange={(newTime) => {
                  const newValue = [...(value[day] || [])];

                  newValue[index] = [newTime.format("HH:mm"), time[1]];
                  const updatedValue = [...value];
                  updatedValue[day] = newValue;
                  onChange(updatedValue);
                }}
              />
              -
              <TimePicker
                value={dayjs(time[1], "HH:mm")}
                size="small"
                format="HH:mm"
                showNow={false}
                onChange={(newTime) => {
                  const newValue = [...(value[day] || [])];
                  newValue[index] = [time[0], newTime.format("HH:mm")];
                  onChange({ ...value, [day]: newValue });
                }}
              />
              {index === value[day].length - 1 && (
                <Button
                  type="secondary"
                  shape="circle"
                  icon={<MinusOutlined />}
                  size="small"
                  onClick={() => {
                    const newValue = [...(value[day] || [])];
                    newValue.splice(index, 1);
                    onChange({ ...value, [day]: newValue });
                  }}
                />
              )}
              {/*index === value[day].length - 1 && (
                <Button
                  type="secondary"
                  shape="circle"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => onAdd(day)}
                />
              )*/}
            </Flex>
          ))}
          {!value[day] ||
            (value[day].length === 0 && (
              <Button
                type="secondary"
                shape="circle"
                icon={<PlusOutlined />}
                size="small"
                onClick={() => onAdd(day)}
              />
            ))}
        </Flex>
      </span>
    </Flex>
  );

  return (
    <Flex vertical={true} gap={8}>
      {weekDays.map((_, index) => (
        <Day key={index} day={index} onAdd={addSlotToDay} onChange={(v) => updateDay(index, v)} />
      ))}
    </Flex>
  );
};

export default OpeningHoursSelector;
