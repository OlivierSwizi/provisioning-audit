import { useTranslation } from "react-i18next";
import { Row, Col, Typography, Input, Card, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDebounce } from "use-debounce";
import { useWorkDispatch } from "@/services/features/UISlice";

import Glyph from "../../common/Glyph";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import useDesignTokens from "@/hook/useDesignTokens";
import { searchRooms } from "@/services/features/CalendarsSlice";

const { Text, Title } = Typography;

const CalendarRoomSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workDispatch = useWorkDispatch();
  const { colors } = useDesignTokens();
  const { appId } = useParams();

  const { roomList, searchTextRoom } = useSelector((state) => state.calendars);

  const [search, setSearch] = useState(searchTextRoom);
  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    workDispatch(searchRooms(search));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <Row style={{ width: "100%" }}>
      <Col span={24}>
        <Input
          size="large"
          allowClear
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined />}
          placeholder={t("calendars.search-bookable-space")}
          value={search}
        />
      </Col>
      <Col span={24}>
        <section style={{ marginTop: "16px", padding: "10px 0" }}>
          <div
            style={{
              display: "grid",
              gridGap: "10px",
              gridTemplateColumns: "repeat(auto-fill, 380px)",
            }}
          >
            {roomList.map((item, idx) => (
              <Card
                key={idx}
                onClick={() => navigate(`/apps/${appId}/calendars/room/${item.ref}`)}
                style={{ cursor: "pointer" }}
                title={
                  <div style={{ display: "flex", flexFlow: "column" }}>
                    <Text strong>
                      <Glyph
                        style={{
                          marginRight: "8px",
                          verticalAlign: "-4px",
                          fontWeight: "normal",
                          color: colors.secondary_base,
                        }}
                        name="location_on"
                      />
                    </Text>
                    <Title level={5}>{item.title}</Title>
                  </div>
                }
                extra={
                  <Typography.Text copyable style={{ fontSize: "12px" }}>
                    {item.ref}
                  </Typography.Text>
                }
                bordered={false}
              >
                <Space style={{ color: colors.grey_60, width: "100%" }} />
                <Row style={{ width: "100%" }}>
                  <Col span={12}>
                    <Typography.Text type={"secondary"}>
                      <Glyph name={"domain"} /> {t("calendars.floor")} {item.floor}
                    </Typography.Text>
                  </Col>
                </Row>
              </Card>
            ))}
          </div>
        </section>
      </Col>
    </Row>
  );
};

export default CalendarRoomSearch;
