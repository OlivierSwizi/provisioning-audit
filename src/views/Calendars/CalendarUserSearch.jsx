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
import { searchUsers } from "@/services/features/CalendarsSlice";

const { Text, Title } = Typography;

const CalendarUserSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const workDispatch = useWorkDispatch();
  const { colors } = useDesignTokens();
  const { appId } = useParams();

  const { userList, searchText } = useSelector((state) => state.calendars);

  const [search, setSearch] = useState(searchText);
  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    workDispatch(searchUsers(search));
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
          placeholder={t("search-user")}
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
            {userList.map((item, idx) => (
              <Card
                key={idx}
                onClick={() => navigate(`/apps/${appId}/calendars/user/${item.id}`)}
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
                        name="person"
                      />
                    </Text>
                    <Title level={5}>{item.displayName}</Title>
                  </div>
                }
                extra={
                  <Typography.Text copyable style={{ fontSize: "12px" }}>
                    {item.id}
                  </Typography.Text>
                }
                bordered={false}
              >
                <Space style={{ color: colors.grey_60, width: "100%" }} />
                <Row style={{ width: "100%" }}>
                  <Col span={24}>
                    <Typography.Text type={"secondary"}>
                      <Glyph name={"email"} /> {item.email}
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

export default CalendarUserSearch;
