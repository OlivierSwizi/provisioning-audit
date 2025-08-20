import { Typography } from "antd";

const ReadOnlyComponent = ({ value }) => {
  return <Typography.Text copyable>{value}</Typography.Text>;
};

export default ReadOnlyComponent;
