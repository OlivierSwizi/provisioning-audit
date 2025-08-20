import ImageSwizi from "@/assets/images/logo_swizi_square.png";
import { useWorkDispatch } from "@/services/features/UISlice";
import { Card, List, Typography } from "antd";
import { groupBy } from "ramda";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loadAppDetails } from "../../services/features/AppsSlice";

const GroupedList = ({ data }) => {
  const navigate = useNavigate();
  const workDispatch = useWorkDispatch();

  const handleSelectApp = async (appId) => {
    await workDispatch(loadAppDetails(appId));
    navigate(`/apps/${appId}`);
  };

  const grouped = useMemo(() => {
    const groups = groupBy((param) => param.name.charAt(0).toUpperCase(), data);
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [data]);

  return grouped.map(([key, apps]) => (
    <>
      <Typography.Title key={key} level={4}>
        {key}
      </Typography.Title>
      <List
        style={{ width: "100%" }}
        grid={{ gutter: 16 }}
        dataSource={apps}
        renderItem={(item) => (
          <List.Item key={item.id} style={{ cursor: "pointer" }}>
            <Card
              style={{ flexDirection: "row" }}
              bodyStyle={{ width: 200 }}
              onClick={() => handleSelectApp(item.id)}
              cover={
                <img
                  style={{ width: 96, height: 96 }}
                  alt=""
                  src={item.iconURL}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = ImageSwizi;
                  }}
                />
              }
              bordered={false}
            >
              <Typography.Title level={5}>{item.name}</Typography.Title>
              <Typography>#{item.id}</Typography>
            </Card>
          </List.Item>
        )}
      />
    </>
  ));
};
export default GroupedList;
