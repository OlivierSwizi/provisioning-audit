import { Form, Tooltip, Typography } from "antd";

const MultiLineFormItem = ({ label, children, tooltip = "", ...props }) => {
  return (
    <Form.Item
      colon={false}
      {...props}
      label={
        tooltip ? (
          <Tooltip title={tooltip}>
            <Typography.Text style={{ whiteSpace: "pre-wrap" }}>{label}</Typography.Text>
          </Tooltip>
        ) : (
          <Typography.Text style={{ whiteSpace: "pre-wrap" }}>{label}</Typography.Text>
        )
      }
    >
      {children}
    </Form.Item>
  );
};

export default MultiLineFormItem;
