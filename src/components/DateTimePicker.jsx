import TimePicker from "./TimePicker";

import { Row, Col, DatePicker } from "antd";

const DateTime = ({ value, onChange }) => {
  return (
    <Row style={{ with: "100%" }}>
      <Col span={12} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <DatePicker value={value} onChange={onChange} allowClear={false} size="middle" />
      </Col>
      <Col
        span={12}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px 0 10px",
        }}
      >
        <TimePicker value={value} onChange={onChange} />
      </Col>
    </Row>
  );
};

export default DateTime;
