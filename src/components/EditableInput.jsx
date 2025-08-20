import { useState } from "react";
import { Input, Button, Typography, Row, Col } from "antd";
import { EditOutlined } from "@ant-design/icons";
import logger from "@/logger";

const EditableInput = ({ value, copyable = false, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [lValue, setLValue] = useState(value);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Perform save operation with the updated value
    logger.log("Saved value:", lValue);
  };

  const handleChange = (e) => {
    setLValue(e.target.value);
  };

  return (
    <div>
      {isEditing ? (
        <Input autoComplete="off" value={lValue} onChange={handleChange} />
      ) : (
        <Row>
          <Col span={22}>
            <Typography.Text style={{ textAlign: "left" }} copyable={copyable}>
              {value}
            </Typography.Text>
          </Col>
          <Col span={2}>
            {onChange ? <Button icon={<EditOutlined />} onClick={handleEdit} /> : null}
          </Col>
        </Row>
      )}
      {isEditing && (
        <Button type="primary" onClick={handleSave}>
          Save
        </Button>
      )}
    </div>
  );
};

export default EditableInput;
