import { Card, Flex, Typography } from "antd";

const AppCard = ({ app, onClick }) => {
  return (
    <Card
      hoverable
      bordered={false}
      style={{ overflow: "hidden", minHeight: 96, align: "center" }}
      styles={{ body: { padding: "0", height: "100%" } }}
      onClick={() => onClick(app.id)}
    >
      <Flex align="center" gap={"1rem"} style={{ height: "100%" }}>
        <img style={{ width: 96 }} alt="" src={app.logoURL} />
        <Flex vertical justify="center" gap={"0.5rem"}>
          <Typography.Title style={{ margin: 0 }} level={5}>
            {app.name}
          </Typography.Title>
          <Typography.Text copyable>#{app.id}</Typography.Text>
        </Flex>
      </Flex>
    </Card>
  );
};

export default AppCard;
