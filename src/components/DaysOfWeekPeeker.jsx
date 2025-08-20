import { Checkbox, Col, Row } from "antd";
import { useTranslation } from "react-i18next";

const DAYS = [
  { label: "sunday-short", value: 0 },
  { label: "monday-short", value: 1 },
  { label: "tuesday-short", value: 2 },
  { label: "wednesday-short", value: 3 },
  { label: "thursday-short", value: 4 },
  { label: "friday-short", value: 5 },
  { label: "saturday-short", value: 6 },
];
const DaysOfWeekPeeker = ({ value = [], onChange }) => {
  const { t } = useTranslation();

  return (
    <Row style={{ width: "100%" }}>
      {DAYS.map((day) => (
        <>
          <Col span={2}>
            <Checkbox
              checked={value.includes(day.value)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...value, day.value]);
                } else {
                  onChange(value.filter((v) => v !== day.value));
                }
              }}
            >
              {t(day.label)}
            </Checkbox>
          </Col>
        </>
      ))}
    </Row>
  );
};

export default DaysOfWeekPeeker;
